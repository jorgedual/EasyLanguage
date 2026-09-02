import { convertToMarkdown } from "../src/markdown";

describe("markdown conversion", () => {
  it("converts headings by level", () => {
    const markdown = convertToMarkdown(
      ["Tema: Proyecto X", "#Introducción", "##Objetivos", "###Detalles"].join("\n")
    );

    expect(markdown).toBe(
      ["# Proyecto X", "## Introducción", "### Objetivos", "#### Detalles"].join("\n")
    );
  });

  it("does not treat tags as headings", () => {
    expect(convertToMarkdown("#todo llamar a Juan")).toBe("**#todo** llamar a Juan");
  });

  it("converts fecha lines to italics", () => {
    expect(convertToMarkdown("fecha: 2026-09-01")).toBe("*fecha: 2026-09-01*");
  });

  it("converts >> highlights to blockquotes", () => {
    expect(convertToMarkdown(">> texto destacado")).toBe("> texto destacado");
  });

  it("converts checkboxes to GitHub task lists", () => {
    expect(convertToMarkdown(["🗸 compra hecha", "□ pendiente revisar"].join("\n"))).toBe(
      ["- [x] compra hecha", "- [ ] pendiente revisar"].join("\n")
    );
  });

  it("converts decorative separators and comments", () => {
    const markdown = convertToMarkdown(
      ["/***/", "/// nota al margen", "/+comentario interno+/"].join("\n")
    );

    expect(markdown).toBe(
      ["---", "<!-- nota al margen -->", "<!-- comentario interno -->"].join("\n")
    );
  });

  it("converts mentions to plain @user", () => {
    expect(convertToMarkdown("hablar con /@juan mañana")).toBe("hablar con @juan mañana");
  });

  it("bolds custom tags too", () => {
    expect(convertToMarkdown("#urgente revisar", ["urgente"])).toBe("**#urgente** revisar");
  });

  it("keeps plain text and bold markers untouched", () => {
    expect(convertToMarkdown("**importante** y texto normal")).toBe(
      "**importante** y texto normal"
    );
  });

  it("preserves indentation", () => {
    expect(convertToMarkdown("  Tema: con sangría")).toBe("  # con sangría");
  });

  it("preserves the trailing newline state", () => {
    expect(convertToMarkdown("#todo una\n")).toBe("**#todo** una\n");
  });
});
