export default async function handler(req: any, res: any) {
  res.json({ isBad: false, matchedWord: "", reason: "Approved" });
}
