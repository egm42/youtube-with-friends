const queue = [
  'OCIg-s7geG8',
  'tueAcSiiqYA',
  'V5uycGosYq4',
  'dfasdfasdfsdf',
  'dfasdfasdfdas'
]

queue.splice(queue.indexOf('df'), 1)

console.log(queue.indexOf('df'))


// queue.forEach((url) => {
//   console.log('***********')

//   switch (new URL(url).pathname.split('/')[1]) {
//     case 'embed':
//       console.log(new URL(url).pathname.split('/').pop());
//       break;
//     case 'watch':
//       console.log(new URL(url).search.split('=')[1]);
//       break
//   }



// })