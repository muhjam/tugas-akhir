const phpGetInitialCode = ({inputSetup, functionName}) => {
    const inputParams = inputSetup?.map((param) => `$${param.name}`);
    const stringInputParams = inputParams.join(', ');

    return `<?php \n\nfunction ${functionName}(${stringInputParams}) {\n\n}`;
};

export default phpGetInitialCode;
