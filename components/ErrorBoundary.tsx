import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Props {
  children: ReactNode;
  /** Optional label for internal identification */
  name?: string;
  /** Render a compact inline fallback instead of full-screen */
  inline?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log in development — never expose stack traces in production
    if (__DEV__) {
      console.error(
        `[ErrorBoundary${this.props.name ? `:${this.props.name}` : ''}] Caught:`,
        error,
        errorInfo,
      );
    }
    this.setState({ error, errorInfo });
  }

  handleRefresh = () => {
    // Reset the error state to allow the app to re-render
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // ── Inline fallback for sub-section boundaries ────────────────────────────
    if (this.props.inline) {
      return (
        <View style={eb.inlineContainer}>
          <Text style={eb.inlineText}>This section is temporarily unavailable.</Text>
          <TouchableOpacity onPress={this.handleRefresh} style={eb.inlineButton}>
            <Text style={eb.inlineButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // ── Full-screen fallback ──────────────────────────────────────────────────
    return (
      <View style={eb.container}>
        {/* Icon */}
        <View style={eb.iconWrapper}>
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#ef4444" />
        </View>

        {/* Heading */}
        <Text style={eb.heading}>Something went wrong</Text>
        <Text style={eb.subheading}>
          We're sorry for the inconvenience. Please tap below to continue.
        </Text>

        {/* Dev-only error details — NEVER shown in production */}
        {__DEV__ && this.state.error ? (
          <ScrollView style={eb.devBox} contentContainerStyle={{ padding: 12 }}>
            <Text style={eb.devText}>{this.state.error.toString()}</Text>
            {this.state.errorInfo ? (
              <Text style={eb.devStack}>{this.state.errorInfo.componentStack}</Text>
            ) : null}
          </ScrollView>
        ) : null}

        {/* Primary action */}
        <TouchableOpacity onPress={this.handleRefresh} style={eb.primaryButton} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconSymbol name="arrow.clockwise" size={20} color="#ffffff" />
            <Text style={eb.primaryButtonText}>Refresh App</Text>
          </View>
        </TouchableOpacity>

        {/* Secondary action */}
        <TouchableOpacity
          onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          style={eb.secondaryButton}
          activeOpacity={0.8}
        >
          <Text style={eb.secondaryButtonText}>Try Again</Text>
        </TouchableOpacity>

        <Text style={eb.helpText}>If the problem persists, please contact support.</Text>
      </View>
    );
  }
}

const eb = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  devBox: {
    width: '100%',
    maxHeight: 180,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  devText: {
    fontSize: 11,
    color: '#dc2626',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  devStack: {
    fontSize: 10,
    color: '#9ca3af',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#f9fafb',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
  // Inline fallback styles
  inlineContainer: {
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    alignItems: 'center',
    margin: 8,
  },
  inlineText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  inlineButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inlineButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
