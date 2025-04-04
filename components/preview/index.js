import React from "react";
import katex from "katex";
import { marked } from "marked";
import "katex/dist/katex.min.css";
import ButtonPreview from "../buttons/button-preview";

const renderLatex = (text, displayMode = false) => {
  try {
    return katex.renderToString(text, { throwOnError: false, displayMode });
  } catch {
    return text; 
  }
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
        const latexHtml = renderLatex(content.replace(/\$/g, ""), false);

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

const convertMarkdownTableToHtml = (markdown) => {
  const lines = markdown.trim().split('\n');
  if (lines.length < 2) return markdown; // Not enough lines for a table

  const headerLine = lines[0];
  const separatorLine = lines[1];
  const dataLines = lines.slice(2);

  // Check if the separator line is valid for a table
  if (!/^(\|[-:]+)+\|$/.test(separatorLine)) return markdown;

  const headers = headerLine.split('|').slice(1, -1).map(header => header.trim());
  const rows = dataLines.map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));

  let html = '<table><thead><tr>';
  headers.forEach(header => {
    html += `<th>${header}</th>`;
  });
  html += '</tr></thead><tbody>';

  rows.forEach(row => {
    html += '<tr>';
    row.forEach(cell => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
};

const renderContent = (text) => {
  // Split text into parts based on markdown tables
  const parts = text.split(/(\|.*?\|(?:\n\|[-:]+[-|:]*)+\n(?:\|.*?\|\n)*)/g);

  return parts.map((part, i) => {
    if (/(\|.*?\|(?:\n\|[-:]+[-|:]*)+\n(?:\|.*?\|\n)*)/.test(part)) {
      // Convert markdown tables to HTML tables
      const html = convertMarkdownTableToHtml(part);
      return <div key={i} dangerouslySetInnerHTML={{ __html: html }} />;
    } else {
      // Process LaTeX and convert \n to <br/> for non-table content
      const latexParts = part.split(/(\$\$.*?\$\$|\$.*?\$)/gs);
      const rendered = latexParts.map((latexPart, j) => {
        if (latexPart.startsWith("$$") && latexPart.endsWith("$$")) {
          return (
            <div
              key={j}
              className="katex-block"
              dangerouslySetInnerHTML={{ __html: renderLatex(latexPart.slice(2, -2), true) }}
            />
          );
        } else if (latexPart.startsWith("$") && latexPart.endsWith("$")) {
          return (
            <span
              key={j}
              className="katex-inline"
              style={{ display: "inline-block", verticalAlign: "middle" }}
              dangerouslySetInnerHTML={{ __html: renderLatex(latexPart.slice(1, -1), false) }}
            />
          );
        } else {
          const withLineBreaks = latexPart.replace(/\n/g, "<br/>");
          return <span key={j} dangerouslySetInnerHTML={{ __html: withLineBreaks }} />;
        }
      });

      return <React.Fragment key={i}>{rendered}</React.Fragment>;
    }
  });
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