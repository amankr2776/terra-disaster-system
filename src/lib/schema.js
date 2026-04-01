/**
 * TERRA Firebase Realtime Database Schema Reference
 * 
 * terra/
 *   activeDisaster/
 *     type: "flood"
 *     severity: "CRITICAL"         
 *     sector: "Sector 4, Mumbai"
 *     affectedPopulation: 842500
 *     evacuationPercent: 42
 *     drainageCapacity: 94
 *     minutesToInundation: 22
 *     lastUpdated: timestamp
 * 
 *   weatherData/
 *     rainfall: 0
 *     windSpeed: 0
 *     temperature: 0
 *     lastUpdated: timestamp
 * 
 *   tacticalFeed/           
 *     -{id}/
 *       message: ""
 *       priority: "CRITICAL|WARNING|INFO"
 *       timestamp: ""
 *       source: "authority|ai"
 * 
 *   aiAnalysis/             
 *     situationReport: ""
 *     evacuationPlan: ""
 *     resourceAllocation: ""
 *     confidence: 96.4
 *     lastUpdated: timestamp
 * 
 *   reliefCamps/
 *     -{id}/
 *       name: ""
 *       distance: ""
 *       capacityPercent: 0
 * 
 *   evacRoutes/
 *     -{id}/
 *       name: ""
 *       status: "clear|blocked"
 */
