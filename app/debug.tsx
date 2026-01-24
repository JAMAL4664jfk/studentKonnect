import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { logger } from "@/lib/debug-logger";
import { supabase } from "@/lib/supabase";

export default function DebugScreen() {
  const colors = useColors();
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runConnectionTest = async () => {
    setTesting(true);
    setLogs([]);
    
    addLog("🔍 Starting connection test...");
    
    try {
      // Test 1: Supabase client exists
      addLog("✅ Supabase client initialized");
      
      // Test 2: Check accommodations table
      addLog("📊 Testing accommodations table...");
      const { data: accData, error: accError } = await supabase
        .from("accommodations")
        .select("*")
        .limit(5);
      
      if (accError) {
        addLog(`❌ Accommodations error: ${accError.message}`);
        addLog(`   Code: ${accError.code}`);
        addLog(`   Details: ${JSON.stringify(accError.details)}`);
      } else {
        addLog(`✅ Accommodations: Found ${accData?.length || 0} items`);
        if (accData && accData.length > 0) {
          addLog(`   First item: ${accData[0].title}`);
        }
      }
      
      // Test 3: Check marketplace table
      addLog("🛒 Testing marketplace table...");
      const { data: mktData, error: mktError } = await supabase
        .from("marketplaceItems")
        .select("*")
        .limit(5);
      
      if (mktError) {
        addLog(`❌ Marketplace error: ${mktError.message}`);
        addLog(`   Code: ${mktError.code}`);
        addLog(`   Details: ${JSON.stringify(mktError.details)}`);
      } else {
        addLog(`✅ Marketplace: Found ${mktData?.length || 0} items`);
        if (mktData && mktData.length > 0) {
          addLog(`   First item: ${mktData[0].title}`);
        }
      }
      
      // Test 4: Check profiles table
      addLog("👤 Testing profiles table...");
      const { data: profData, error: profError } = await supabase
        .from("profiles")
        .select("*")
        .limit(5);
      
      if (profError) {
        addLog(`❌ Profiles error: ${profError.message}`);
      } else {
        addLog(`✅ Profiles: Found ${profData?.length || 0} users`);
      }
      
      // Test 5: Check auth session
      addLog("🔐 Checking auth session...");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addLog(`❌ Session error: ${sessionError.message}`);
      } else if (sessionData.session) {
        addLog(`✅ User logged in: ${sessionData.session.user.email}`);
      } else {
        addLog(`ℹ️  No active session (not logged in)`);
      }
      
      addLog("🎉 Connection test complete!");
      
    } catch (error: any) {
      addLog(`❌ Test failed: ${error.message}`);
      console.error("Debug test error:", error);
    } finally {
      setTesting(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.text, marginBottom: 16 }}>
          🔧 Debug Console
        </Text>
        
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24 }}>
          Test database connections and view detailed logs
        </Text>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={runConnectionTest}
            disabled={testing}
            style={{
              flex: 1,
              backgroundColor: testing ? colors.border : colors.primary,
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            {testing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "600" }}>Run Test</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={clearLogs}
            style={{
              flex: 1,
              backgroundColor: colors.border,
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "600" }}>Clear Logs</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            minHeight: 400,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 12 }}>
            Console Output
          </Text>
          
          {logs.length === 0 ? (
            <Text style={{ color: colors.textSecondary, fontStyle: "italic" }}>
              No logs yet. Run a test to see output.
            </Text>
          ) : (
            logs.map((log, index) => (
              <Text
                key={index}
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: log.includes("❌") ? "#ef4444" : log.includes("✅") ? "#10b981" : colors.text,
                  marginBottom: 4,
                }}
              >
                {log}
              </Text>
            ))
          )}
        </View>

        <View style={{ marginTop: 24, padding: 16, backgroundColor: colors.card, borderRadius: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 8 }}>
            Configuration
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, fontFamily: "monospace" }}>
            Supabase URL: https://ortjjekmexmyvkkotioo.supabase.co
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, fontFamily: "monospace", marginTop: 4 }}>
            Environment: {__DEV__ ? "Development" : "Production"}
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
