const jsGetInitialCode = ({ inputSetup, functionName }) => {
  const inputParams = inputSetup?.map((param) => param.name);
  const stringInputParams = inputParams.join(', ');

  return `function ${functionName}(${stringInputParams}) {\n\n}`;
};

export default jsGetInitialCode;
