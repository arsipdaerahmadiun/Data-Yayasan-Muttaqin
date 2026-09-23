const fs = require('fs');
const glob = require('glob');

function hideButtons(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace <button> with {readOnly ? null : <button>} for buttons that mutate data
  // Look for buttons that have onClick that contains "setEditing", "setAssetToDelete", "setIsAdd", "handleDelete", "handleAdd"
  
  // It's easier to just do it manually with multi_edit_file for the few main files.
  
}
