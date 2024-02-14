export default async function ({ addon, console }) {
  const customBlockTypes = ["procedures_prototype", "procedures_definition", "procedures_call"];
  const vm = addon.tab.traps.vm;
  var BlocklyInstance = await addon.tab.traps.getBlockly();
  const workspace = BlocklyInstance.getMainWorkspace();
  const getBlock = (id) => vm.editingTarget.blocks.getBlock(id) || vm.runtime.flyoutBlocks.getBlock(id);
  const getComment = (block) => block && block.comment && vm.editingTarget.comments[block.comment];
  const getProcedureDefinitionBlock = (procCode) => {
    const procedurePrototype = Object.values(vm.editingTarget.blocks._blocks).find(
      (i) => i.opcode === "procedures_prototype" && i.mutation.proccode === procCode
    );
    if (procedurePrototype) {
      // Usually `parent` will exist but sometimes it doesn't
      if (procedurePrototype.parent) {
        return getBlock(procedurePrototype.parent);
      }
      const id = procedurePrototype.id;
      return Object.values(vm.editingTarget.blocks._blocks).find(
        (i) => i.opcode === "procedures_definition" && i.inputs.custom_block && i.inputs.custom_block.block === id
      );
    }
    return null;
  };

  function setCustomBlockColors() {
    // Get all blocks in the workspace
    var allBlocks = workspace.getAllBlocks();

    // Define a mapping between custom block names and colors

    // Iterate through each block and set color based on the name (for custom blocks only)
    allBlocks.forEach(function (block) {
      console.log(block.type);

      if (block.type === "procedures_call") {
        // Check if it's a custom block
        const b = getBlock(block.id);
        const procCode = b.mutation.proccode;
        const procedureDefinitionBlock = getProcedureDefinitionBlock(procCode);
        const procedureComment = getComment(procedureDefinitionBlock);

        if (procedureComment) {
          block.setColour(procedureComment.text);
        }
      }
    });
  }

  function onWorkspaceChanged() {
    setCustomBlockColors();
  }
  workspace.addChangeListener(onWorkspaceChanged);
}
