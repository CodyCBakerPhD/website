"""Fixes two things in the TypeScript that gen-typescript writes for a LinkML schema.

- Enum members are renamed to snake_case after their values. gen-typescript
  names a member after its value's title, or else its text, with characters it
  cannot use spelled out ("standards:NWB" becomes standardsCOLONNWB); here
  "standards:NWB" becomes standards_nwb and "organisms:C. elegans" becomes
  organisms_c_elegans.
- Fields whose range is an enum are typed as that enum. gen-typescript types
  them as a bare string, dropping the [] even when the slot is multivalued.

Run by scripts/generate-schemas.sh on the file it writes.

Usage: python3 scripts/postprocess_typescript.py schemas/records.yaml src/build/generated/records.ts
"""

import re
import sys
from pathlib import Path

from linkml_runtime.utils.formatutils import camelcase, underscore
from linkml_runtime.utils.schemaview import SchemaView

ENUM = re.compile(r"^export enum (\w+) \{$")
INTERFACE = re.compile(r"^export interface (\w+)\b")
MEMBER = re.compile(r'^(\s*)[A-Za-z_$][\w$]* = "((?:[^"\\]|\\.)*)",$')
FIELD = re.compile(r"^(\s*)(\w+)(\??): string,$")


def snake_case(value: str) -> str:
    name = re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
    return f"number_{name}" if name[:1].isdigit() else name


def enum_fields(view: SchemaView) -> dict[tuple[str, str], str]:
    """The TypeScript type of every enum-ranged field, keyed by (interface, field), as gen-typescript names them."""
    enums = view.all_enums()
    fields = {}
    for cls in view.all_classes().values():
        for slot_name in view.class_slots(cls.name, direct=True):
            slot = view.induced_slot(slot_name, cls.name)
            if slot.range in enums:
                field = underscore(slot.alias or slot.name)
                fields[(camelcase(cls.name), field)] = camelcase(slot.range) + ("[]" if slot.multivalued else "")
    return fields


def main(schema: Path, path: Path) -> None:
    fields = enum_fields(SchemaView(str(schema)))
    lines = path.read_text().split("\n")
    enum, interface, names = None, None, set()
    for index, line in enumerate(lines):
        if match := ENUM.match(line):
            enum, names = match.group(1), set()
        elif match := INTERFACE.match(line):
            interface = match.group(1)
        elif line.startswith("}"):
            enum = interface = None
        elif enum and (match := MEMBER.match(line)):
            indent, value = match.groups()
            name = snake_case(value)
            if name in names:
                sys.exit(f"{path}: two members of {enum} would both be named {name}")
            names.add(name)
            lines[index] = f'{indent}{name} = "{value}",'
        elif interface and (match := FIELD.match(line)) and (interface, match.group(2)) in fields:
            indent, field, optional = match.groups()
            lines[index] = f"{indent}{field}{optional}: {fields.pop((interface, field))},"
    if fields:
        sys.exit(f"{path}: did not find the enum-ranged fields {sorted(fields)}")
    path.write_text("\n".join(lines))


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
