import { Router, Request, Response } from "express";
import { checkAuth } from "../middlewares/auth.middlewares";
import callProcedure from "../libs/callProcedure";

const router = Router();

router.post("/friend/", checkAuth(["contestant"]), async (req: Request, res: Response) => {
    const { friendHandle } = req.body;
    const handle = req.user?.handle;

    if (!handle || !friendHandle) {
        res.status(400).json({ message: "Both handle and friend_handle are required." });
        return;
    }

    const newFriend = {
        handle,
        friendHandle
    };

    try {
        await callProcedure("create_friend", [newFriend.handle, newFriend.friendHandle]);
        res.status(201).json({ success: true, message: "Friendship created successfully." });
    } catch (e: any) {
        console.error("Error creating friendship:", e);
        res.status(500).json({ success: false, message: e.message });
    }
});


router.delete("/friend/", checkAuth(["contestant"]), async (req: Request, res: Response) => {
    const { friendHandle } = req.body;
    const handle = req.user?.handle;

    if (!handle || !friendHandle) {
        res.status(400).json({ message: "Both handle and friend_handle are required." });
        return;
    }

    try {
        await callProcedure("delete_friend", [handle, friendHandle]);
        res.status(200).json({ success: true, message: "Friendship deleted successfully." });
    } catch (e: any) {
        console.error("Error deleting friendship:", e);
        res.status(500).json({ success: false, message: e.message });
    }
});


export default router;
