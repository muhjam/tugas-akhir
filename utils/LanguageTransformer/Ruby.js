const rubyGetInitialCode = ({ inputSetup, functionName }) => {
  const inputParams = inputSetup?.map((param) => param.name);
  const stringInputParams = inputParams.join(', ');

  return `def ${functionName}(${stringInputParams}) \n\nend\n`;
};

export default rubyGetInitialCode;
