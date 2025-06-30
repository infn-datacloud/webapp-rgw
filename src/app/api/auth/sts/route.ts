import { S3Service } from "@/services/s3";

export async function POST(request: Request) {
  const { access_token } = await request.json();
  if (!access_token) {
    return Response.json(
      { error: "missing access token" },
      {
        status: 400,
      }
    );
  }
  const credentials = await S3Service.loginWithSTS(access_token);
  return new Response(JSON.stringify({ ...credentials }));
}
