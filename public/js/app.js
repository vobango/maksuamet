const selectNodes = (members, subSelection) => {
  const recipients = document.getElementById('js-recipients').querySelectorAll('input');
  recipients.forEach(node => {
    const match = subSelection.find(member => member._id === node.id);
    node.checked = !!match;
  });
};

const selectStudents = (members) => {
  const students = members.filter(member => member.details.student === true);
  selectNodes(members, students);
};

const selectNonStudents = (members) => {
  const nonStudents = members.filter(member => member.details.student === false);
  selectNodes(members, nonStudents);
};

const selectAll = (members) => {
  selectNodes(members, members);
};

const deselectAll = () => {
  selectNodes([], []);
};

