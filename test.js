let postcode = 'co2 7EW';
let shortpc = postcode.slice(0, 2);
console.log(shortpc);

if (shortpc.toUpperCase() !== 'CO') {
  console.log('not colchester PC');
}
