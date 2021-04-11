import { NextApiResponse } from "next";

export default function(req, res: NextApiResponse) {
  res.setPreviewData({});
  res.redirect(req.query.route);
}