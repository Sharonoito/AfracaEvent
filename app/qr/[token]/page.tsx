import { sql } from "@/lib/database"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

interface QRPageProps {
  params: {
    token: string
  }
}

export default async function QRPage({ params }: QRPageProps) {
  const { token } = params
  let qrData: any = null // declare outside so it's visible in catch too

  try {
    const qrResult = await sql`
      SELECT 
        qc.user_id,
        qc.qr_token,
        qc.created_at,
        qc.event_id,              -- ✅ include event_id for insert
        e.name as event_name,
        e.website_url,
        e.start_date,
        e.end_date,
        e.location,
        u.name as user_name,
        u.email
      FROM qr_codes qc
      LEFT JOIN events e ON qc.event_id = e.id
      JOIN users u ON qc.user_id = u.id
      WHERE qc.qr_token = ${token} AND qc.expires_at > NOW()
    `

    if (qrResult.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-red-600">Invalid QR Code</CardTitle>
              <CardDescription>This QR code is invalid or has expired.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )
    }

    qrData = qrResult[0]

    // ✅ use real event_id instead of hardcoded 1
    await sql`
      INSERT INTO check_ins (user_id, event_id, checked_in_at)
      VALUES (${qrData.user_id}, ${qrData.event_id}, NOW())
      ON CONFLICT DO NOTHING
    `

    // If event has a website URL, redirect there
    if (qrData.website_url && qrData.website_url.startsWith("http")) {
      redirect(qrData.website_url)
    }

    // Otherwise show check-in confirmation
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <CardTitle className="text-green-800">Check-in Successful!</CardTitle>
                <CardDescription>Welcome to {qrData.event_name || "Tech Innovation Summit 2024"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Attendee: {qrData.user_name}</p>
              <p className="text-sm text-gray-600">{qrData.email}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-medium mb-2">Event Details</h3>
              {qrData.start_date && qrData.end_date ? (
                <p className="text-sm text-gray-600">
                  {new Date(qrData.start_date).toLocaleDateString()} - {new Date(qrData.end_date).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-sm text-gray-600">March 15-16, 2024</p>
              )}
              <p className="text-sm text-gray-600">{qrData.location || "Tech Convention Center"}</p>
            </div>

            {qrData.website_url && (
              <Link
                href={qrData.website_url}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                Visit Event Website
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}

            <Link
              href="/dashboard"
              className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Event Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("QR code processing error:", error.message, error.stack, qrData)
    } else {
      console.error("QR code processing error:", error, qrData)
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>There was an error processing your QR code. Please try again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
}


// import { sql } from "@/lib/database"
// import { redirect } from "next/navigation"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { CheckCircle, ExternalLink } from "lucide-react"
// import Link from "next/link"

// interface QRPageProps {
//   params: {
//     token: string
//   }
// }

// export default async function QRPage({ params }: QRPageProps) {
//   const { token } = params

//   try {
//     const qrResult = await sql`
//       SELECT 
//         qc.user_id,
//         qc.qr_token,
//         qc.created_at,
//         e.name as event_name,
//         e.website_url,
//         e.start_date,
//         e.end_date,
//         e.location,
//         u.name as user_name,
//         u.email
//       FROM qr_codes qc
//       LEFT JOIN events e ON qc.event_id = e.id
//       JOIN users u ON qc.user_id = u.id
//       WHERE qc.qr_token = ${token} AND qc.expires_at > NOW()
//     `

//     if (qrResult.length === 0) {
//       return (
//         <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
//           <Card className="max-w-md w-full">
//             <CardHeader>
//               <CardTitle className="text-red-600">Invalid QR Code</CardTitle>
//               <CardDescription>This QR code is invalid or has expired.</CardDescription>
//             </CardHeader>
//           </Card>
//         </div>
//       )
//     }

//     const qrData = qrResult[0]

//     await sql`
//       INSERT INTO check_ins (user_id, event_id, checked_in_at)
//       VALUES (${qrData.user_id}, 1, NOW())
//       ON CONFLICT DO NOTHING
//     `

//     // If event has a website URL, redirect there
//     if (qrData.website_url) {
//       redirect(qrData.website_url)
//     }

//     // Otherwise show check-in confirmation
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
//         <Card className="max-w-md w-full">
//           <CardHeader>
//             <div className="flex items-center gap-3">
//               <CheckCircle className="h-8 w-8 text-green-600" />
//               <div>
//                 <CardTitle className="text-green-800">Check-in Successful!</CardTitle>
//                 <CardDescription>Welcome to {qrData.event_name || "Tech Innovation Summit 2024"}</CardDescription>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <p className="font-medium">Attendee: {qrData.user_name}</p>
//               <p className="text-sm text-gray-600">{qrData.email}</p>
//             </div>

//             <div className="bg-gray-50 p-3 rounded-lg">
//               <h3 className="font-medium mb-2">Event Details</h3>
//               {qrData.start_date && qrData.end_date ? (
//                 <p className="text-sm text-gray-600">
//                   {new Date(qrData.start_date).toLocaleDateString()} - {new Date(qrData.end_date).toLocaleDateString()}
//                 </p>
//               ) : (
//                 <p className="text-sm text-gray-600">March 15-16, 2024</p>
//               )}
//               <p className="text-sm text-gray-600">{qrData.location || "Tech Convention Center"}</p>
//             </div>

//             {qrData.website_url && (
//               <Link
//                 href={qrData.website_url}
//                 className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
//               >
//                 Visit Event Website
//                 <ExternalLink className="h-4 w-4" />
//               </Link>
//             )}

//             <Link
//               href="/dashboard"
//               className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Go to Event Dashboard
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   } catch (error) {
//     // console.error("QR code processing error:", error)
//     console.error("QR code processing error:", error.message, error.stack, qrData)

//     return (
//       <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
//         <Card className="max-w-md w-full">
//           <CardHeader>
//             <CardTitle className="text-red-600">Error</CardTitle>
//             <CardDescription>There was an error processing your QR code. Please try again.</CardDescription>
//           </CardHeader>
//         </Card>
//       </div>
//     )
//   }
// }
