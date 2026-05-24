export const experienceConflicts: Record<
  string,
  string[]
> = {

  snorkeling: [

  "mermaiding",

  "horses",

  "airplane",

  "mongolfiera",
],




  mermaiding: [
    "snorkeling",
    "horses",

  "airplane",

  "mongolfiera",
  ],





  foodwine: [

  "restaurant",

  "horses",

  "airplane",

  "mongolfiera",
],




  restaurant: [
    "foodwine",
  ],




  sailing: [
    "motorboat",

    "airplane",

  "mongolfiera",

   "horses",
  ],



  motorboat: [
    "sailing",

    "airplane",

  "mongolfiera",

   "horses",
  ],



  trekking: [
    "horses",
  ],




  horses: [
    "trekking",
     "mermaiding",
"sailing",

     "motorboat",
  "snorkeling",

 
  ],




  mongolfiera: [

  "mermaiding",

  "snorkeling",

  "foodwine",

  "airplane",

    "motorboat",

     "sailing",


],
};