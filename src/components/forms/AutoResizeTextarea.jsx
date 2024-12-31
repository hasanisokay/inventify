import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

const AutoResizeTextarea = ({ value, index, handleChange }) => {
  return (
    <TextareaAutosize
      value={value}
      onChange={handleChange}
      className="pt-1.5 pb-1.5 pl-1 border mt-1 resize-none border-gray-400 rounded text-black overflow-auto transition-all"
      placeholder="Note"
      minRows={1}  // Minimum number of rows
      maxRows={6}  // Maximum number of rows
    />
  );
};

export default AutoResizeTextarea;
