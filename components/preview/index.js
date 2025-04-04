import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import ButtonPreview from "../buttons/button-preview";
import DOMPurify from "dompurify";

const renderLatex = (text, displayMode = false) => {
  try {
    return katex.renderToString(text, { throwOnError: false, displayMode });
  } catch {
    return text;
  }
};

const convertMarkdownTableToHtml = (markdown) => {
  const lines = markdown.trim().split("\n");
  if (lines.length < 2) return markdown;

  const headerLine = lines[0];
  const separatorLine = lines[1];
  const dataLines = lines.slice(2);

  if (!/^\|[\s-:]+\|([\s-:]+\|)*$/.test(separatorLine)) return markdown;

  const headers = headerLine.split("|").slice(1, -1).map((h) => h.trim());
  const rows = dataLines.map((line) =>
    line.split("|").slice(1, -1).map((cell) => cell.trim())
  );

  let html = "<table border='1' style='border-collapse: collapse; width: 100%;'>";
  html +=
    "<thead><tr>" +
    headers
      .map(
        (header) =>
          `<th style='border: 1px solid black; padding: 5px;'>${header}</th>`
      )
      .join("") +
    "</tr></thead><tbody>";

  rows.forEach((row) => {
    html +=
      "<tr>" +
      row
        .map(
          (cell) =>
            `<td style='border: 1px solid black; padding: 5px;'>${cell}</td>`
        )
        .join("") +
      "</tr>";
  });

  html += "</tbody></table>";
  return html;
};

const renderTextWithLatex = (text) => {
  const latexParts = text.split(/(\$\$.*?\$\$|\$.*?\$)/gs);

  return latexParts.map((part, i) => {
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const latexContent = part.slice(2, -2);
      return (
        <div
          key={i}
          className="katex-block"
          dangerouslySetInnerHTML={{
            __html: renderLatex(latexContent, true),
          }}
        />
      );
    }

    else if (part.startsWith("$") && part.endsWith("$")) {
      const latexContent = part.slice(1, -1);
      return (
        <span
          key={i}
          className="katex-inline"
          style={{ display: "inline-block", verticalAlign: "middle" }}
          dangerouslySetInnerHTML={{
            __html: renderLatex(latexContent, false),
          }}
        />
      );
    }
    // Teks biasa: ubah newline menjadi <br/>
    else {
      return (
        <span
          key={i}
          dangerouslySetInnerHTML={{
            __html: part.replace(/\n/g, "<br/>"),
          }}
        />
      );
    }
  });
};

const renderContent = (text) => {
  const pattern =
    /(<svg[\s\S]*?<\/svg>)|(^\|[^\n]+\|\n\|[-:\s|]+\|\n(?:\|[^\n]+\|\n?)*)/gm;

  let elements = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      if (before.trim()) {
        elements.push(
          <React.Fragment key={`text-${lastIndex}`}>
            {renderTextWithLatex(before)}
          </React.Fragment>
        );
      }
    }

    const svgGroup = match[1];
    const tableGroup = match[2];

    if (svgGroup) {
      elements.push(
        <div
          key={`svg-${match.index}`}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(svgGroup) }}
        />
      );
    } else if (tableGroup) {
      const tableHtml = convertMarkdownTableToHtml(tableGroup);
      elements.push(
        <div
          key={`table-${match.index}`}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tableHtml) }}
        />
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining.trim()) {
      elements.push(
        <React.Fragment key={`remaining-${lastIndex}`}>
          {renderTextWithLatex(remaining)}
        </React.Fragment>
      );
    }
  }

  return elements;
};

const Preview = ({ children, isEditMode, clickHandler }) => {
  return (
    <div className="border border-gray-100 pb-4 rounded-[3px] overflow-scroll h-[500px] relative">
      <div className="sticky z-[10] top-0 left-0 w-full flex justify-between items-center border-b border-b-gray-100 px-[3px] h-fit bg-white">
        <span className="text-[14px] text-gray-500 py-[2px] ml-1">Preview</span>
        <ButtonPreview isEditMode={isEditMode} clickHandler={clickHandler} />
      </div>
      <div className="prose max-w-full p-2">
        {typeof children === "string" ? renderContent(children) : children}
      </div>
    </div>
  );
};

export default Preview;
