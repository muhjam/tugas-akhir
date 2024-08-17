const pythonGetInitialCode = ({ functionName, inputSetup }) => {
  const inputParams = inputSetup?.map((param) => param.name);
  const stringInputParams = inputParams.join(', ');

  return `def ${functionName}(${stringInputParams}): \n\t`;
};

export default pythonGetInitialCode;
