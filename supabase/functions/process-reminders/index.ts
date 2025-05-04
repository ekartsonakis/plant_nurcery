// Process reminders and send email notifications
// This edge function can be scheduled to run daily

import { createClient } from "npm:@supabase/supabase-js";
import { format } from "npm:date-fns";
import { SmtpClient } from "npm:smtp";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Initialize SMTP client
const smtp = new SmtpClient({
  connection: {
    hostname: Deno.env.get("SMTP_HOST") || "",
    port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
    tls: true,
    auth: {
      username: Deno.env.get("SMTP_USER") || "",
      password: Deno.env.get("SMTP_PASS") || "",
    },
  },
});

async function sendReminderEmail(reminder: any) {
  const { title, description, email } = reminder;
  
  await smtp.send({
    from: Deno.env.get("SMTP_FROM") || "",
    to: email,
    subject: `Reminder: ${title}`,
    content: `
      <h2>${title}</h2>
      ${description ? `<p>${description}</p>` : ''}
      <p>This reminder is now due.</p>
    `,
    html: true,
  });
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get reminders that are due today and haven't been sent
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: dueReminders, error } = await supabaseClient
      .from("reminders")
      .select("*")
      .eq("sent", false)
      .lte("due_date", format(today, "yyyy-MM-dd"));

    if (error) {
      throw error;
    }

    const results = {
      processed: 0,
      errors: 0,
    };

    // Process each reminder and send email
    for (const reminder of dueReminders || []) {
      try {
        // Check if the reminder's time has passed
        const reminderTime = new Date(`${reminder.due_date}T${reminder.time}`);
        if (reminderTime <= new Date()) {
          // Send email notification
          await sendReminderEmail(reminder);
          
          // Mark reminder as sent
          const { error: updateError } = await supabaseClient
            .from("reminders")
            .update({ sent: true })
            .eq("id", reminder.id);

          if (updateError) {
            throw updateError;
          }

          results.processed++;
        }
      } catch (err) {
        console.error(`Error processing reminder ${reminder.id}:`, err);
        results.errors++;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${results.processed} reminders with ${results.errors} errors`,
        processed: results.processed,
        errors: results.errors,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (err) {
    console.error("Error processing reminders:", err);
    
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});