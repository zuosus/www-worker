export async function sendPushNotification(
  pushContent: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const url = `https://api.day.app/SRKdLy3N9tQWUdHBt5Dr8g/${encodeURIComponent(pushContent)}`
    const response = await fetch(url, { method: 'GET' })

    if (response.ok) {
      return { success: true, message: 'Push notification sent successfully' }
    } else {
      return {
        success: false,
        message: `Failed to send push notification. Status: ${response.status}`,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Error sending push notification: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
