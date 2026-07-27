import jwt from "jsonwebtoken"
const genToken =async(userId)=>{
    try{
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
    }
    catch(error){
        console.log(error);
    }
}
export default genToken ;
// import jwt from "jsonwebtoken";

// const genToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: "7d",
//   });
// };
