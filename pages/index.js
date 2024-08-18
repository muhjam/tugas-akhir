import Head from "next/head";
import { Fragment, useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import LanguageTransformer from '../utils/LanguageTransformer';
import { codeEditorLanguageTransformer } from '../utils';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Swal from 'sweetalert2';  

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false },
);

const Editor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { ssr: false },
);


export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputSetup, setInputSetup] = useState([
    { name: '', type: 'string' },
  ]);
  const [codeExample, setCodeExample] = useState({
    language: 'typescript',
    function_name: '',
    code: '',
  });
  const [languages, setLanguages] = useState([
    "javascript",
    "php",
    "go",
    "python",
    "java",
    "scala",
    "c#",
    "visual basic",
    "rust",
    "typescript",
    "ruby",
    "dart",
    "kotlin",
    "c",
    "c++"
  ]);
  const [testCase, setTestCase] = useState([{ input: [''], expected: '' }, { input: [''], expected: '' }]);
  const [testCaseResult, setTestCaseResult] = useState([]);
  const [outputType, setOutputType] = useState('string');
  const [disableAddParamBtn, setDisableAddParamBtn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  async function onGenerate(event) {
    event.preventDefault();
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: prompt}),
      });


      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      if(JSON.parse(data.result)){

      const convertedData = JSON.parse(data.result).map(item => ({
        name: item.title,
        text: item.description,
        setup: {
            input: item.inputSetup.map(input => ({
                name: input.name,
                type: input.type === 'integer' ? 'int' : input.type
            })),
            output: item.outputType === 'integer' ? 'int' : item.outputType,
            code_example: {
                language: item.codeExample.language.toLowerCase(),
                function_name: item.codeExample.function_name,
                code: item.codeExample.code
            }
        },
        test_case: item.testCase,
        topics: item.topics
    }));
    
      setResult(convertedData);

        const result = JSON.parse(data.result);
        setTitle(result[0].title);
        setDescription(result[0].description);
        setInputSetup(result[0].inputSetup);
        setOutputType(result[0].outputType);
        setTestCase(result[0].testCase);
        setCodeExample(result[0].codeExample);
        setTopic(result[0].topics);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  }

  const updateInputDataHandler = (index, key, value) => {
    const updatedData = [...inputSetup];
    updatedData[index][key] = value;
    setInputSetup(updatedData);
  };

  const addParametersHandler = () => {
    setInputSetup((state) => [...state, { name: '', type: 'string' }]);
  };

  const deleteParamsHandler = (index) => {
    const updatedData = inputSetup.filter((_, i) => index !== i);
    setInputSetup(updatedData);
  };

  useEffect(() => {
    setDisableAddParamBtn(!inputSetup[inputSetup.length - 1].name.length);
  }, [inputSetup]);

  const addTestCaseHandler = () => {
    setTestCase((state) => [...state, { input: [''], expected: '' }]);
  };

  const updateTestCaseInputHandler = (indexTestCases, indexInput, value) => {
    const updatedTestCases = testCase.map((tc, i) => {
      if (i === indexTestCases) {
        tc.input[indexInput] = value;
      }
      return tc;
    });
    setTestCase(updatedTestCases);
  };

  const updateTestCaseExpectedHandler = (indexTestCases, value) => {
    const updatedTestCases = testCase.map((tc, i) => {
      if (i === indexTestCases) {
        tc.expected = value;
      }
      return tc;
    });
    setTestCase(updatedTestCases);
  };

  const deleteTestCaseHandler = (index) => {
    const updatedData = testCase?.filter((_, i) => index !== i);
    const updateResult = testCaseResult?.filter((_, i) => index !== i);
    setTestCaseResult(updateResult);
    setTestCase(updatedData);
  };

  const updateInitialCode = (functionName = null) => {
    // variables used within this block: inputSetup, outputType, testCase
    const code = LanguageTransformer({
      language: codeExample.language,
      functionName: functionName || codeExample.function_name,        
      inputSetup,
      outputType,
      testCase: testCase[0] ?? { input: [''], expected: '' },
    });

    setCodeExample((state) => ({
      ...state,
      code
    }));
  };

  useEffect(() => {
    if(!result){
      updateInitialCode();
    }
  }, [codeExample.language, inputSetup, outputType]);

  const handleToggleModal = () => {
    const convertedData = [{
      name: title,
      text: description,
      setup: {
        input: inputSetup.map(input => ({
          name: input.name,
          type: input.type === 'integer' ? 'int' : input.type
        })),
        output: outputType === 'integer' ? 'int' : outputType,
        code_example: {
          language: codeExample.language.toLowerCase(),
          function_name: codeExample.function_name,
          code: codeExample.code
        }
      },
      test_case: testCase,
      topics: topic
    }];

    setResult(convertedData);
    setIsModalOpen(!isModalOpen);
  };
  

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCopy = () => {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
  
    Toast.fire({
      icon: "success",
      title: "Copied successfully"
    });
  };


  return (
    <>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/quest.png" />
      </Head>
      {isModalOpen && (
        <>
        <div className="fixed top-0 right-0 bottom-0 left-0 bg-black opacity-[0.6] h-screen z-[10]" onClick={handleCloseModal}></div>
        <div
          id="static-modal"
          ref={modalRef}
          tabIndex="-1"
          aria-hidden="true"
          className="inset-0 fixed top-0 right-0 left-0 bottom-0 z-50 flex justify-center items-center w-full"
          >
          <div className="relative p-4 w-full max-w-2xl max-h-full">
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow">
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                <h3 className="text-xl font-semibold text-gray-900">
                  Export String Json
                </h3>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              {/* Modal body */}
              <div className="p-4 md:p-5 space-y-4 overflow-y-auto max-h-[400px] text-wrap">
                  {JSON.stringify( result )}
              </div>
              {/* Modal footer */}
              <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b">
              <CopyToClipboard text={JSON.stringify( result )} onCopy={handleCopy}>
                <button
                  onClick={handleCloseModal}
                  className="text-white bg-green-500 hover:bg-green-400 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-md text-sm px-5 py-2.5 text-center"
                >
                  Copy
                </button>
                </CopyToClipboard>
                <button
                  onClick={handleCloseModal}
                  className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-md border border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    <div className="p-[8px] md:p-[24px] flex justify-center">
      <div className="max-w-[1080px] w-full shadow-md p-4">
        <div className="flex justify-center mb-[8px]">
          <div className="max-w-[500px]">
            <h1 className="text-[24px] font-[600] text-center">
              Prototype for Creating Questions
            </h1>
            <h2 className="text-[14px] text-gray-800 font-[500] text-center">
              Automatically generate programming logic questions story using AI <br/> developed by <a href="https://www.instagram.com/muhamadjamaludinpad/" className="font-[600] hover:underline">Jamjam</a>.
            </h2>
          </div>
        </div>

        <div className="flex flex-col mb-[8px]">
        <form onSubmit={ onGenerate }>
          <label htmlFor="prompt" className="text-[14px] font-[600]">Prompt:</label>
          <div className="flex w-full gap-2 flex-wrap md:flex-nowrap">
            <input type="text" id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none" placeholder="Example: Naruto vs Sasuke ..." required />
            <div className="flex items-center gap-2 justify-end w-full md:w-auto">
              <button type="submit" className={`${isGenerating ? 'bg-gray-300 hover:bg-gray-400 focus:ring-gray-300 cursor-wait' : 'bg-green-500 hover:bg-green-600 focus:ring-green-300'} text-white focus:ring-4 focus:outline-none font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center h-fit`}>{isGenerating ? 'Loading...' : 'Generate'}</button>
              <button type="button" className="text-white bg-sky-500 hover:bg-sky-600 focus:ring-4 focus:outline-none focus:ring-sky-300 font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center h-fit" onClick={handleToggleModal}>Export</button>
            </div>
          </div>
          </form>
        </div>

        <div className="flex flex-col mb-[8px]">
          <label htmlFor="title" className="text-[14px] font-[600]">Title:</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none" required />
        </div>

        <div className="mb-[8px]">
          <label htmlFor="description" className="text-[14px] font-[600]">Description:</label>
          <MDEditor
            className="focus:outline-none focus:ring-0 focus:border-none"
            id="description"
            data-color-mode="light"
            value={description} 
            onChange={(value) => setDescription(value)} 
          />
        </div>

        <div className="flex flex-col mb-[8px]">
          <label className="text-[14px] font-[600]">Input Setup:</label>
          {inputSetup.map((item, index) => (
          <div className="flex gap-2 mb-[8px]">
            <Fragment key={index}>
              <input
                required
                type="text"
                value={item.name}
                onChange={(e) =>
                  updateInputDataHandler(
                    index,
                    'name',
                    e.target.value,
                  )
                }
                className="w-full md:w-1/3 border-disable mt-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 focus:outline-none"
              />
              <select
                id="types"
                value={item.type || ''}
                onChange={(e) =>
                  updateInputDataHandler(
                    index,
                    'type',
                    e.target.value,
                  )
                }
                className="w-full md:w-1/3 border-disable mt-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 focus:outline-none cursor-pointer">
                <option value="string">string</option>
                <option value="int">int</option>
                <option value="float">float</option>
                <option value="boolean">boolean</option>
                <option value="array">array</option>
              </select>
              {inputSetup.length > 1 &&(
              <button
                type="button"
                onClick={() => deleteParamsHandler(index)}
                className="w-[14] text-red-500 font-bold">
                X
              </button>
              )}
            </Fragment>
        </div>
          ))}
        </div>
        <button
          onClick={addParametersHandler}
          disabled={disableAddParamBtn}
          type="button"
          className={`${disableAddParamBtn
            ? 'bg-sky-300 cursor-not-allowed '
            : 'bg-sky-500'
            } cursor-pointer text-right text-xs text-white py-2 px-14 rounded-sm mb-[16px]`}>
          Add Parameters
        </button>

        <div className="mb-[8px]">
          <label className="text-[14px] font-[600]">Output Type:</label>
          <select
            id="types"
            className="w-full md:w-1/3 border-disable mt-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 focus:outline-none cursor-pointer"
            value={outputType || ''}
            onChange={(e) => setOutputType(e.target.value)}>
            <option value="string">string</option>
            <option value="int">int</option>
            <option value="float">float</option>
            <option value="boolean">boolean</option>
            <option value="array">array</option>
          </select>
        </div>

        <div className="flex flex-col mb-[8px]">
          {testCase.map((tc, index) => (
            <div key={index} className="mt-[16px]">
              <div className="flex w-full gap-10">
                <div className="w-full md:w-1/3">
                  <label className="mt-5 text-sm font-bold text-black">
                    Test Case No {index + 1}
                    {testCase.length > 2 ? (
                      <span
                        onClick={() => deleteTestCaseHandler(index)}
                        className="text-[10px] ml-2 text-red-500 font-bold border border-red p-1 hover:cursor-pointer">
                        Remove Test Case
                      </span>) : null}
                  </label>
                  <p className="text-sm font-semibold text-black mt-3">
                    Input
                  </p>
                  <div className="w-full">
                    {inputSetup.map((item, i) => (
                      <div key={i}>
                        <label
                          className="mr-5 text-xs font-semibold text-black"
                          htmlFor={'input_' + item.name}>
                          {item.name || 'param_' + (i + 1)}
                        </label>
                        <br />
                        {item.type === 'boolean' ? (
                          <select
                            id={'input_' + item.name}
                            value={testCase[index].input[i] || ''}
                            onChange={(e) =>
                              updateTestCaseInputHandler(
                                index,
                                i,
                                e.target.value,
                              )
                            }
                            className="w-full border-disable mt-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 focus:outline-none cursor-pointer">
                            <option value="" disabled>
                              --option--
                            </option>
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                        ) : item.type === 'string' ||
                          item.type === 'array' ? (
                          <textarea
                            id={'input_' + item.name}
                            rows="3"
                            cols="30"
                            value={testCase[index].input[i]}
                            onChange={(e) =>
                              updateTestCaseInputHandler(
                                index,
                                i,
                                e.target.value,
                              )
                            }
                            className="w-full border-disable mt-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 focus:outline-none"
                          />
                        ) : item.type === 'int' ? (
                          <input
                            id={'input_' + item.name}
                            type="number"
                            value={parseInt(testCase[index].input[i], 10)}
                            onChange={(e) =>
                              updateTestCaseInputHandler(
                                index,
                                i,
                                parseInt(+e.target.value, 10),
                              )
                            }
                            className="w-full border-disable mt-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 focus:outline-none"
                          />
                        ) : (
                          <input
                            id={'input_' + item.name}
                            type="number"
                            value={parseFloat(testCase[index].input[i])}
                            onChange={(e) =>
                              updateTestCaseInputHandler(
                                index,
                                i,
                                parseFloat(+e.target.value),
                              )
                            }
                            className="w-full border-disable mt-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 focus:outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-sm font-semibold text-black mt-3">
                    Expected
                  </p>
                  <div className="w-full">
                    {outputType === 'boolean' ? (
                      <select
                        id={'expected_' + index || ''}
                        value={tc.expected}
                        onChange={(e) =>
                          updateTestCaseExpectedHandler(
                            index,
                            e.target.value,
                          )
                        }
                        className="w-full border-disable mt-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 focus:outline-none cursor-pointer">
                        <option value="" disabled>
                          --option--
                        </option>
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : outputType === 'string' ||
                      outputType === 'array' ? (
                      <textarea
                        id={'expected_' + index}
                        rows="3"
                        cols="30"
                        value={tc.expected || ''}
                        onChange={(e) =>
                          updateTestCaseExpectedHandler(
                            index,
                            e.target.value,
                          )
                        }
                        className="w-full border-disable mt-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 focus:outline-none"
                      />
                    ) : outputType === 'int' ? (
                      <input
                        id={'expected_' + index}
                        type="number"
                        value={parseInt(tc.expected, 10)}
                        onChange={(e) =>
                          updateTestCaseExpectedHandler(
                            index,
                            parseInt(+e.target.value, 10),
                          )
                        }
                        className="w-full border-disable mt-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 focus:outline-none"
                      />
                    ) : (
                      <input
                        id={'expected_' + index}
                        type="number"
                        value={parseFloat(tc.expected)}
                        onChange={(e) =>
                          updateTestCaseExpectedHandler(
                            index,
                            parseFloat(+e.target.value),
                          )
                        }
                        className="w-full border-disable mt-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      <button
        type="button"
        className="bg-sky-500 cursor-pointer text-right text-xs text-white py-2 px-14 rounded-sm mt-[8px] mb-[16px]"
        onClick={addTestCaseHandler}>
        Add Test Case
      </button>

      <div className="mb-[8px]">
          <label htmlFor="description" className="text-[14px] font-[600]">Code Example:</label>
          <p className="text-[12px] font-semibold text-black mt-[4px] mb-2">
          Language
        </p>
        <select
          id="languages"
         className="w-full border-disable mt-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 focus:outline-none cursor-pointer mb-[8px]"
          value={codeExample.language.toLowerCase()}
          onChange={(e) =>
            setCodeExample((state) => ({
              ...state,
              language: e.target.value,
            }))
          }>
          {languages.map((item, i) => (
            <option value={item || ''} key={i}>
              {item}
            </option>
          ))}
        </select>
        <>
        <label className="text-[12px] font-[600] text-black">Function Name*</label>
        <input
          required
          type="text"
          value={codeExample.function_name || ''}
          onChange={(e) => {
            setCodeExample((state) => ({
              ...state,
              function_name: e.target.value,
            }));
          }}
          className="w-full border-disable mt-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 focus:outline-none mb-[8px]"
        />
        <Editor
          height="35vh"
          width="100%"
          language={codeEditorLanguageTransformer(codeExample.language.toLowerCase())}
          // defaultValue={initialCode(parameters, cases)[language]()}
          value={codeExample.code || ''}
          theme="vs-dark"
          onChange={(val) =>
            setCodeExample((state) => ({ ...state, code: val }))
          }
        />
        </>
     </div>

     <div className="flex flex-col mb-[8px]">
          <label htmlFor="topic" className="text-[14px] font-[600]">Topic:</label>
          <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none" required />
      </div>
    </div>
  </div>
  </>
  );
}
