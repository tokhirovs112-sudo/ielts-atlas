#!/usr/bin/env python3
"""Lightweight static checks for Englisity's local HTML asset references."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SKIP_SCHEMES = {"http", "https", "mailto", "tel", "data", "javascript", "blob"}


class ReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.references = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in {"href", "src"} and value:
                self.references.append((tag, key, value.strip()))


def local_target(source: Path, raw: str):
    parsed = urlsplit(raw)
    if parsed.scheme.lower() in SKIP_SCHEMES or raw.startswith("//"):
        return None
    target = unquote(parsed.path)
    if not target:
        return None
    if target.startswith("/"):
        return ROOT / target.lstrip("/")
    return (source.parent / target).resolve()


def main():
    html_files = sorted(ROOT.rglob("*.html"))
    errors = []
    checked = 0
    for file in html_files:
        parser = ReferenceParser()
        parser.feed(file.read_text(encoding="utf-8"))
        for tag, attr, raw in parser.references:
            target = local_target(file, raw)
            if target is None:
                continue
            checked += 1
            if not target.is_file():
                rel_source = file.relative_to(ROOT)
                try:
                    rel_target = target.relative_to(ROOT)
                except ValueError:
                    rel_target = target
                errors.append(f"{rel_source}: {tag}[{attr}] points to missing file: {raw} (resolved: {rel_target})")

    if errors:
        print("Broken local references found:")
        for error in errors:
            print(f" - {error}")
        raise SystemExit(1)

    print(f"Checked {len(html_files)} HTML files and {checked} local file references; no broken references found.")


if __name__ == "__main__":
    main()
