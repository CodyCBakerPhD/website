"""
Requires

pip install pillow
"""

import pathlib

import PIL.Image

def create_favicon(
    image_file_path: pathlib.Path,
    favicon_file_path: pathlib.Path,
    size: tuple[int, int] = (16, 16)
) -> None:
    img = PIL.Image.open(image_file_path)
    img = img.resize(size, PIL.Image.LANCZOS)  # Resize the image
    img.save(favicon_file_path, format="ICO")


if __name__ == "__main__":
    image_file_path = pathlib.Path(__file__).parent / "full_como_icon.jpg"
    favicon_file_path = pathlib.Path(__file__).parent / "como_favicon.ico"

    create_favicon(image_file_path=image_file_path, favicon_file_path=favicon_file_path)
