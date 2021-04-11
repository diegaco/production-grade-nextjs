import { NextApiResponse } from "next";

export default function(req, res: NextApiResponse) {
  res.clearPreviewData();
  res.end('preview mode disabled');
}