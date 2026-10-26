const pencils = document.getElementsByClassName("fa-pencil");
const trash = document.getElementsByClassName("fa-times");

Array.from(pencils).forEach(function (element) {
  element.addEventListener('click', function () {
    const id = this.parentNode.parentNode.dataset.id
    const grade = this.parentNode.parentNode.querySelector('.newGrade').value
    if (!grade) {
      return alert('Type a new grade in the box before adding.')
    }
    fetch('assignments', {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'id': id,
        'grade': grade
      })
    })
      .then(response => {
        if (response.ok) return response.json()
      })
      .then(data => {
        console.log(data)
        window.location.reload(true)
      })
  });
});

Array.from(trash).forEach(function (element) {
  element.addEventListener('click', function () {
    const id = this.parentNode.parentNode.dataset.id
    fetch('assignments', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'id': id
      })
    }).then(function (response) {
      window.location.reload()
    })
  });
});
