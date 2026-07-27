import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {
        let { token } = req.cookies;
        if (!token) {
            return res.status(400).json({ message: "user does not have token" })
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!verifyToken) {
            res.status(400).json({ message: "user does not have valid token" });
        }

        req.userId = verifyToken.id;
        next();

    } catch (error) {
        res.status(500).json({ message: `isAuth error found ${error}` })
    }

}
export default isAuth;
