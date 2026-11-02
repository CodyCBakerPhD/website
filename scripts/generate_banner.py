"""Generate src/public/img/banner.svg, the background of the "never stop learning" banner.

Draws clusters of branching, neuron-like arbors (with a few translucent ribbons behind them)
anchored to the left and right edges of the banner. The random generator is seeded, so rerunning
this reproduces the same file. Needs only the Python standard library:

    python scripts/generate_banner.py
"""

import math
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src" / "public" / "img" / "banner.svg"

# Each cluster is drawn in its own W x H viewBox, nested in one half of the banner and pinned to
# that half's outer edge, so the clusters hug the edges at any banner width.
W = 960
H = 320
# How far into its half a cluster reaches before it has faded out.
REACH = 620

LEFT_SEED = 20231
RIGHT_SEED = 7


def r1(n: float) -> float:
    return round(n, 1)


def format(n: float) -> str:
    n = r1(n)
    return str(int(n)) if n == int(n) else str(n)


def cluster(seed: int) -> dict:
    rng = random.Random(seed)

    def between(lo: float, hi: float) -> float:
        return lo + (hi - lo) * rng.random()

    # Somas thin out away from the edge; rejection sampling keeps them from piling up.
    somas = []
    for _ in range(5000):
        if len(somas) == 34:
            break
        x = r1(REACH * rng.random() ** 1.6)
        y = r1(between(10, H - 10))
        if all(math.hypot(s["x"] - x, s["y"] - y) > 40 for s in somas):
            somas.append({"x": x, "y": y, "r": between(2.2, 4), "far": rng.random() < 0.4})

    # Each neuron is one path, drawn depth-first with relative moves; markers put a dot on every node.
    for soma in somas:
        d = [f"M{format(soma['x'])} {format(soma['y'])}"]
        pen = (soma["x"], soma["y"])

        def grow(x: float, y: float, angle: float, length: float, depth: int, max_depth: int) -> None:
            nonlocal pen
            if pen != (x, y):
                d.append(f"M{format(x)} {format(y)}")
            nx = r1(x + math.cos(angle) * length)
            ny = r1(y + math.sin(angle) * length)
            d.append(f"l{format(nx - x)} {format(ny - y)}")
            pen = (nx, ny)
            if depth == max_depth:
                return
            roll = rng.random()
            if roll < 0.45:
                spread = between(0.4, 1)
                for side in (-1, 1):
                    grow(nx, ny, angle + side * spread / 2 + between(-0.15, 0.15), length * between(0.72, 0.88), depth + 1, max_depth)
            elif roll < 0.92:
                grow(nx, ny, angle + between(-0.5, 0.5), length * between(0.82, 0.98), depth + 1, max_depth)

        scale = 0.65 if soma["far"] else 1
        dendrites = 3 + rng.randrange(3)
        offset = rng.random() * math.tau
        for i in range(dendrites):
            angle = offset + i / dendrites * math.tau + between(-0.4, 0.4)
            grow(soma["x"], soma["y"], angle, between(16, 28) * scale, 0, 3 + rng.randrange(3))
        # A longer, sparsely branched axon, so neighboring arbors read as one connected network.
        if not soma["far"] and rng.random() < 0.7:
            heading = between(-1, 1) + (math.pi if rng.random() < 0.3 else 0)
            grow(soma["x"], soma["y"], heading, between(34, 48), 2, 6)

        soma["d"] = "".join(d)
        soma["opacity"] = between(0.55, 1)

    # Silky ribbons: families of cubic curves whose endpoints and control points drift apart,
    # so the strands fan out and cross like folded translucent sheets.
    ribbons = []
    for y0, y1 in ((between(-40, 40), between(150, 230)), (between(260, 360), between(40, 130))):
        twist = between(50, 90) * (-1 if rng.random() < 0.5 else 1)
        reach = between(380, 470)
        strands = []
        n = 30
        for i in range(n):
            t = i / (n - 1)
            strands.append(
                f"M-10 {format(y0 + t * 60)}"
                f"C{format(reach * 0.3 + t * 30)} {format(y0 - twist + t * twist * 2)} "
                f"{format(reach * 0.6 - t * 30)} {format(y1 + twist - t * twist * 2 + math.sin(t * math.pi) * 16)} "
                f"{format(reach + t * 40)} {format(y1 + t * 50)}"
            )
        ribbons.append("".join(strands))

    return {"neurons": somas, "ribbons": ribbons}


def render_cluster(neuron_cluster: dict) -> str:
    def layer(far: bool) -> str:
        return "".join(f'<path d="{n["d"]}" opacity="{format(n["opacity"])}"/>' for n in neuron_cluster["neurons"] if n["far"] == far)

    somas = "".join(
        f'<circle cx="{format(n["x"])}" cy="{format(n["y"])}" r="{format(n["r"] * 4.5)}" fill="url(#halo)" '
        f'opacity="{format(n["opacity"] * (0.5 if n["far"] else 1))}"/>'
        f'<circle cx="{format(n["x"])}" cy="{format(n["y"])}" r="{format(n["r"] * (0.7 if n["far"] else 1))}" '
        f'fill="{"#9fdde6" if n["far"] else "#e3fffb"}" opacity="{0.6 if n["far"] else 0.95}"/>'
        for n in neuron_cluster["neurons"]
    )
    ribbons = "".join(f'<path d="{d}"/>' for d in neuron_cluster["ribbons"])
    return (
        '<g class="net" mask="url(#fade)">'
        f'<g class="ribbons" fill="none" stroke="url(#ribbon)" stroke-width="0.6">{ribbons}</g>'
        '<g fill="none" stroke="#5fb8c9" stroke-width="0.6" marker-mid="url(#dot-far)" marker-end="url(#dot-far)" '
        f'filter="url(#soften)">{layer(True)}</g>'
        '<g fill="none" stroke="#7fe0d6" stroke-width="0.8" stroke-opacity="0.8" marker-mid="url(#dot)" '
        f'marker-end="url(#dot)">{layer(False)}</g>'
        f"{somas}</g>"
    )


def render() -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
<style>
.ribbons {{ opacity: 0.45; }}
/* Media queries here see the rendered banner's width. The narrower it is, the more of the dense
   edges sit behind the text, so quiet them down. */
@media (max-width: 1100px) {{ .net {{ opacity: 0.75; }} }}
@media (max-width: 860px) {{ .net {{ opacity: 0.5; }} }}
</style>
<defs>
<linearGradient id="bg" x1="0" x2="1" y1="0" y2="0">
<stop offset="0" stop-color="#0a2f3a"/><stop offset="0.5" stop-color="#0a4450"/><stop offset="1" stop-color="#0a4752"/>
</linearGradient>
<radialGradient id="glow" cx="0.5" cy="0" r="0.6">
<stop offset="0" stop-color="#1d7f8a" stop-opacity="0.45"/><stop offset="1" stop-color="#1d7f8a" stop-opacity="0"/>
</radialGradient>
<radialGradient id="halo">
<stop offset="0" stop-color="#5eead4" stop-opacity="0.5"/><stop offset="1" stop-color="#5eead4" stop-opacity="0"/>
</radialGradient>
<linearGradient id="ribbon" gradientUnits="userSpaceOnUse" x1="0" x2="460" y1="0" y2="0">
<stop offset="0" stop-color="#8b7ae6"/><stop offset="0.4" stop-color="#4fa3d9"/><stop offset="1" stop-color="#2dd4c8"/>
</linearGradient>
<linearGradient id="fade-ramp" gradientUnits="userSpaceOnUse" x1="0" x2="{REACH}" y1="0" y2="0">
<stop offset="0" stop-color="#fff"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
</linearGradient>
<mask id="fade" maskUnits="userSpaceOnUse" x="-50" y="-50" width="{W + 100}" height="{H + 100}">
<rect x="-50" y="-50" width="{W + 100}" height="{H + 100}" fill="url(#fade-ramp)"/>
</mask>
<marker id="dot" viewBox="-1 -1 2 2" markerWidth="2.8" markerHeight="2.8" markerUnits="userSpaceOnUse"><circle r="1" fill="#c4f7f0"/></marker>
<marker id="dot-far" viewBox="-1 -1 2 2" markerWidth="2.2" markerHeight="2.2" markerUnits="userSpaceOnUse"><circle r="1" fill="#8fd3e0"/></marker>
<filter id="soften" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="0.6"/></filter>
</defs>
<rect width="100%" height="100%" fill="url(#bg)"/>
<rect width="100%" height="100%" fill="url(#glow)"/>
<svg width="50%" height="100%" viewBox="0 0 {W} {H}" preserveAspectRatio="xMinYMid slice">{render_cluster(cluster(LEFT_SEED))}</svg>
<svg x="50%" width="50%" height="100%" viewBox="0 0 {W} {H}" preserveAspectRatio="xMaxYMid slice"><g transform="matrix(-1 0 0 1 {W} 0)">{render_cluster(cluster(RIGHT_SEED))}</g></svg>
</svg>
"""


if __name__ == "__main__":
    svg = render()
    OUT.write_text(svg)
    print(f"Wrote {OUT} ({len(svg) / 1000:.1f} kB)")
