import React from "react";
import katex from "katex";
import { marked } from "marked";
import "katex/dist/katex.min.css";

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

const processBoldText = (text) => {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
};

const processMarkdown = (text) => {
  const withLineBreaks = text.replace(/\n/g, "<br/>");
  const processedBold = processBoldText(withLineBreaks);
  const parsedMarkdown = marked.parse(processedBold);
  return parsedMarkdown.replace(/<p>/g, "<span>").replace(/<\/p>/g, "</span>");
};


const renderContent = (text) => {
    const parts = text.split(/(<svg[\s\S]*?<\/svg>)/gs);
  
    return parts.map((part, i) => {
      if (part.startsWith("<svg") && part.endsWith("</svg>")) {
        const { processedSvg, latexElements } = processSvgWithLatex(part);
        return (
          <div key={i} className="relative inline-block">
            <div dangerouslySetInnerHTML={{ __html: processedSvg }} />
            {latexElements}
          </div>
        );
      }
  
      // Bagi lagi bagian LaTeX
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
          const html = processMarkdown(latexPart);
          return <span key={j} dangerouslySetInnerHTML={{ __html: html }} />;
        }
      });
  
      return <React.Fragment key={i}>{rendered}</React.Fragment>;

    });
};
  
const Preview = ({ children }) => {
  return (
    <div className="border p-4 rounded overflow-scroll h-[480px] relative">
      <div className="prose max-w-full">
        {typeof children === "string" ? renderContent(children) : children}
      </div>
    </div>
  );
};

export default Preview;
