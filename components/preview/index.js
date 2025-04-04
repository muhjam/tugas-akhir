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
  html += "<thead><tr>";
  html += headers
    .map(
      (header) =>
        `<th style='border: 1px solid black; padding: 5px;'>${header}</th>`
    )
    .join("");
  html += "</tr></thead><tbody>";

  rows.forEach((row) => {
    html += "<tr>";
    html += row
      .map(
        (cell) => `<td style='border: 1px solid black; padding: 5px;'>${cell}</td>`
      )
      .join("");
    html += "</tr>";
  });

  html += "</tbody></table>";
  return html;
};

const processSvgWithLatex = (svgText) => {
  const latexMatches = [...svgText.matchAll(/<text\s+([^>]+)>(.*?)<\/text>/gs)];
  let processedSvg = svgText;
  const latexElements = [];

  latexMatches.forEach((match, index) => {
    const attributes = match[1]; 
    const content = match[2];   

    if (/\$.*?\$/.test(content)) {
      const coordsMatch = attributes.match(/x="([\d.]+)"\s+y="([\d.]+)"/);
      if (coordsMatch) {
        const [_, x, y] = coordsMatch;
        const latexString = content.replace(/\$/g, "");
        const latexHtml = renderLatex(latexString, false);

        processedSvg = processedSvg.replace(match[0], "");

        latexElements.push(
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${x}px`,
              top: `${y}px`,
              transform: "translate(-50%, -50%)",
              whiteSpace: "nowrap",
            }}
            dangerouslySetInnerHTML={{ __html: latexHtml }}
          />
        );
      }
    }
  });

  return { processedSvg, latexElements };
};

const renderSvgWithLatex = (svgString, key) => {
  const { processedSvg, latexElements } = processSvgWithLatex(svgString);
  return (
    <div key={key} style={{ position: "relative", display: "inline-block" }}>
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(processedSvg) }} />
      {latexElements}
    </div>
  );
};

const renderTextWithLatex = (text, key) => {
  const latexParts = text.split(/(\$\$.*?\$\$|\$.*?\$)/gs);
  return (
    <React.Fragment key={key}>
      {latexParts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const content = part.slice(2, -2);
          return (
            <div
              key={i}
              className="katex-block"
              dangerouslySetInnerHTML={{ __html: renderLatex(content, true) }}
            />
          );
        }
        else if (part.startsWith("$") && part.endsWith("$")) {
          const content = part.slice(1, -1);
          return (
            <span
              key={i}
              className="katex-inline"
              style={{ display: "inline-block", verticalAlign: "middle" }}
              dangerouslySetInnerHTML={{ __html: renderLatex(content, false) }}
            />
          );
        }
        // Teks biasa -> ubah newline menjadi <br/>
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
      })}
    </React.Fragment>
  );
};

const renderContent = (text) => {
  const pattern =
    /(<svg[\s\S]*?<\/svg>)|(^\|[^\n]+\|\n\|[-:\s|]+\|\n(?:\|[^\n]+\|\n?)*)/gm;

  let elements = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      if (before.trim()) {
        elements.push(renderTextWithLatex(before, `txt-${keyCounter++}`));
      }
    }

    const svgGroup = match[1];
    const tableGroup = match[2];

    if (svgGroup) {
      elements.push(renderSvgWithLatex(svgGroup, `svg-${keyCounter++}`));
    } else if (tableGroup) {
      const html = convertMarkdownTableToHtml(tableGroup);
      elements.push(
        <div
          key={`table-${keyCounter++}`}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
        />
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining.trim()) {
      elements.push(renderTextWithLatex(remaining, `end-${keyCounter++}`));
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
