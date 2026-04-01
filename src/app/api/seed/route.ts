import { NextResponse } from "next/server"
import { initializeApp, getApps, getApp } from "firebase/app"
import { getDatabase, ref, set } from "firebase/database"

/**
 * @fileOverview Seeding endpoint for Firebase Realtime Database.
 * 
 * This route allows for a one-click initialization of the tactical disaster 
 * intelligence grid.
 */

export async function GET() {
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: "https://terra-digital-twin-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    // Initialize Firebase in the API context
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    const db = getDatabase(app)

    // Seed the 'terra' node with a structured Mumbai flood scenario
    await set(ref(db, "terra"), {
      activeDisaster: {
        type: "flood",
        severity: "CRITICAL",
        sector: "Sector 4, Mumbai",
        affectedPopulation: 842500,
        evacuationPercent: 42,
        drainageCapacity: 94,
        minutesToInundation: 22,
        lastUpdated: new Date().toISOString()
      },
      weatherData: {
        rainfall: 18,
        windSpeed: 34,
        temperature: 29
      },
      tacticalFeed: {
        entry1: {
          message: "Levee breach confirmed at Sector 4 North",
          priority: "CRITICAL",
          source: "authority",
          timestamp: new Date().toISOString()
        },
        entry2: {
          message: "Strike Team Bravo deployed to Marine Drive",
          priority: "INFO",
          source: "authority",
          timestamp: new Date().toISOString()
        },
        entry3: {
          message: "High tide synchronization detected. Coastal risk +20%",
          priority: "WARNING",
          source: "authority",
          timestamp: new Date().toISOString()
        }
      },
      reliefCamps: {
        camp1: { name: "City Central School", distance: "0.8", capacityPercent: 80 },
        camp2: { name: "Community Hall B", distance: "1.5", capacityPercent: 45 },
        camp3: { name: "Sports Arena North", distance: "2.2", capacityPercent: 100 }
      },
      evacRoutes: {
        route1: { name: "GST Road Exit", status: "clear" },
        route2: { name: "Highway 17 North", status: "clear" }
      }
    })

    return NextResponse.json({ success: true, message: "Firebase seeded successfully" })
  } catch (error: any) {
    console.error("Seeding Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
