import React, { useState } from "react";
import dynamic from "next/dynamic";
import "katex/dist/katex.min.css";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import Preview from "../preview";
import { FaRegEdit } from "react-icons/fa";
import { FaSave } from "react-icons/fa";

// Dynamic import agar tidak crash saat SSR
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

const Editor = ({ value, onChange, id, index, label }) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const handleChange = (val) => {
    onChange(index, id, val);
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  return (
    <div className="space-y-1">
        <div className="flex justify-between items-center">
            <label htmlFor={`${id}-${index}`} className="text-[14px] font-[600]">{label}:</label>
            <button
                onClick={toggleEditMode}
                className={`text-blue-500 transition duration-200 hover:bg-gray-100 p-1`}
            >
                {isEditMode ? <FaSave/> : <FaRegEdit/>}
            </button>
        </div>

      {isEditMode ? (
        <MDEditor
          id={`${id}-${index}`}
          preview="edit"
          data-color-mode="light"
          value={value}
          onChange={handleChange}
          className="focus:outline-none focus:ring-0 focus:border-none"
          height={500}
          extraCommands={[]}
          previewOptions={{
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex, rehypeRaw],
          }}
        />
      ) : (
          <Preview>{value}</Preview>
      )}
    </div>
  );
};

export default Editor;
