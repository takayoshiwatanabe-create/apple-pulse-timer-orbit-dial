# Project Design Specification

This file is the single source of truth for this project. All code must conform to this specification.

## Constitution (Project Rules)
# Apple Pulse Timer / Orbit Dial プロジェクト憲法

## 基本理念
1. **Apple製品との完璧な統合**: Appleエコシステムの一部として機能する、ネイティブな体験を提供する
2. **物理性とデジタルの融合**: 触覚的な満足感とデジタルの利便性を両立させる
3. **集中力の質的向上**: 単なるタイマーではなく、深い集中状態をサポートするツール

## 技術制約
- **プラットフォーム**: React Native + Expo (SDK 50+)
- **対応OS**: iOS 16.0+、Android 10+ (API level 29+)
- **外部依存**: Expo公式ライブラリ優先、ネイティブモジュールは最小限
- **パフォーマンス**: 60fps維持、バッテリー使用量最適化

## セキュリティ要件
- **データプライバシー**: 個人データはデバイス内保存、クラウド同期は暗号化必須
- **権限管理**: 最小権限の原則、必要な権限のみ要求
- **GDPR/CCPA準拠**: ユーザー同意管理、データ削除機能

## 品質基準
- **アクセシビリティ**: WCAG 2.1 AA準拠、VoiceOverサポート
- **国際化**: 日本語・英語対応、RTLレイアウト考慮
- **エラーハンドリング**: グレースフルデグラデーション、オフライン対応

## ビジネス制約
- **収益モデル**: フリーミアム（基本機能無料）+ プレミアム機能 + 非侵入型広告
- **App Store審査**: ガイドライン完全準拠、リジェクトリスク最小化
- **マネタイゼーション**: 広告は集中時間外のみ、プレミアム機能は付加価値重視

## Design Specification
# Apple Pulse Timer / Orbit Dial 設計仕様書

## システムアーキテクチャ

### 技術スタック
- **Frontend**: React Native 0.73 + Expo SDK 50
- **Navigation**: Expo Router (File-based routing)
- **State Management**: Zustand + React Query
- **Animation**: Reanimated 3 + Gesture Handler
- **Database**: SQLite (Expo SQLite)
- **Push Notifications**: Expo Notifications
- **Analytics**: Expo Analytics + Firebase Analytics

### アプリ構成
```
src/
├── app/                    # Expo Router pages
├── components/            # 再利用可能コンポーネント
├── hooks/                 # カスタムフック
├── stores/               # Zustand stores
├── utils/                # ユーティリティ
├── constants/            # 定数定義
└── types/                # TypeScript型定義
```

## データベース設計

### SQLite Schema
```sql
-- タイマー設定
CREATE TABLE timer_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  focus_duration INTEGER NOT NULL,    -- 分単位
  break_duration INTEGER NOT NULL,
  long_break_duration INTEGER,
  cycles_until_long_break INTEGER DEFAULT 4,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- セッション記録
CREATE TABLE focus_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_id INTEGER REFERENCES timer_configs(id),
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  session_type TEXT CHECK(session_type IN ('focus', 'break', 'long_break')),
  completed BOOLEAN DEFAULT FALSE,
  interruption_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ユーザー設定
CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY,
  haptic_enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  focus_mode_sync BOOLEAN DEFAULT FALSE,
  theme TEXT DEFAULT 'auto',
  premium_active BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE
);

-- 統計データ
CREATE TABLE daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  total_focus_time INTEGER DEFAULT 0,  -- 分単位
  sessions_completed INTEGER DEFAULT 0,
  sessions_interrupted INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 画面構成・ナビゲーション

### Expo Router構成
```
app/
├── (tabs)/
│   ├── _layout.tsx           # タブレイアウト
│   ├── index.tsx             # メインタイマー
│   ├── stats.tsx             # 統計画面
│   └── settings.tsx          # 設定画面
├── timer/
│   └── [id].tsx              # カスタムタイマー
├── onboarding/
│   └── index.tsx             # オンボーディング
└── _layout.tsx               # ルートレイアウト
```

## コンポーネント設計

### 主要コンポーネント
1. **CircularTimer**: メイン円形タイマー表示
2. **RotaryBezel**: 無段階回転ベゼル操作
3. **FlipGestureHandler**: 重力センサー対応フリップ検出
4. **HapticButton**: ハプティックフィードバック付きボタン
5. **ProgressRing**: 光のリング進捗表示
6. **SandGradient**: 砂時計風グラデーション
7. **FocusModeSync**: iOS集中モード連携

### 状態管理

#### Timer Store (Zustand)
```typescript
interface TimerState {
  // タイマー状態
  isRunning: boolean;
  currentSession: 'focus' | 'break' | 'long_break';
  timeRemaining: number; // 秒
  totalDuration: number;
  cycleCount: number;
  
  // 設定
  config: TimerConfig;
  
  // アクション
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  switchSession: () => void;
  updateConfig: (config: Partial<TimerConfig>) => void;
}
```

#### Settings Store
```typescript
interface SettingsState {
  hapticEnabled: boolean;
  soundEnabled: boolean;
  focusModeSync: boolean;
  theme: 'light' | 'dark' | 'auto';
  premiumActive: boolean;
  
  updateSettings: (settings: Partial<SettingsState>) => void;
}
```

## API設計

### Analytics API
```typescript
// 使用統計送信
POST /api/analytics/session
{
  sessionId: string;
  duration: number;
  completed: boolean;
  sessionType: 'focus' | 'break';
  timestamp: string;
}

// 広告表示ログ
POST /api/ads/impression
{
  adId: string;
  placement: string;
  userId: string; // 匿名化済み
}
```

### Premium機能API
```typescript
// プレミアム状態確認
GET /api/user/premium-status
Response: {
  active: boolean;
  expiresAt?: string;
  features: string[];
}
```

## 外部連携仕様

### iOS Focus Mode連携
- Shortcuts.app integration for focus mode automation
- Siri shortcuts for timer start/stop
- WidgetKit for home screen widgets

### Push Notifications
- Timer completion notifications
- Break reminders
- Daily streak notifications
- Focus session summaries

## パフォーマンス要件

### アニメーション仕様
- 60fps maintain using Reanimated 3
- UI thread optimization for circular progress
- Gesture handling with native driver

### メモリ管理
- SQLite connection pooling
- Image optimization and caching
- Background task management

## Development Instructions
# Apple Pulse Timer / Orbit Dial 開発指示書

## Phase 1: プロジェクト初期設定 (Week 1)

### 1.1 Expo プロジェクト作成
```bash
npx create-expo-app@latest apple-pulse-timer --template
cd apple-pulse-timer
npx expo install expo-router expo-constants expo-linking expo-status-bar
```

### 1.2 必須依存関係インストール
```bash
# コア依存関係
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install react-native-safe-area-context react-native-screens
npx expo install expo-sqlite expo-notifications expo-haptics
npx expo install expo-sensors expo-device-motion

# 状態管理・データフェッチ
npm install zustand @tanstack/react-query
npm install @react-native-async-storage/async-storage

# UI・アニメーション
npm install react-native-svg react-native-linear-gradient
npx expo install expo-linear-gradient expo-blur

# 開発ツール
npm install -D @types/react @types/react-native typescript
npm install -D eslint @typescript-eslint/eslint-plugin prettier
```

### 1.3 app.json 設定
```json
{
  "expo": {
    "name": "Apple Pulse Timer",
    "slug": "apple-pulse-timer",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.applepulsetimer",
      "buildNumber": "1",
      "infoPlist": {
        "NSMotionUsageDescription": "This app uses motion sensors to detect device flips for timer control.",
        "BGTaskSchedulerPermittedIdentifiers": ["$(PRODUCT_BUNDLE_IDENTIFIER).background-task"]
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.applepulsetimer",
      "versionCode": 1,
      "permissions": [
        "android.permission.VIBRATE",
        "android.permission.WAKE_LOCK"
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/sounds/timer-complete.wav"]
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### 1.4 EAS Build設定
```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m1-medium"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Phase 2: コア機能実装 (Week 2-3)

### 2.1 基本ファイル構造構築
```
src/
├── app/
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx         # メインタイマー
│   │   ├── stats.tsx         # 統計
│   │   └── settings.tsx      # 設定
│   └── onboarding/
│       └── index.tsx
├── components/
│   ├── timer/
│   │   ├── CircularTimer.tsx
│   │   ├── RotaryBezel.tsx
│   │   └── ProgressRing.tsx
│   └── ui/
│       ├── HapticButton.tsx
│       └── SandGradient.tsx
├── hooks/
│   ├── useTimer.ts
│   ├── useFlipGesture.ts
│   └── useHaptic.ts
├── stores/
│   ├── timerStore.ts
│   ├── settingsStore.ts
│   └── statsStore.ts
├── utils/
│   ├── database.ts
│   ├── haptics.ts
│   └── notifications.ts
└── constants/
    ├── Colors.ts
    └── Layout.ts
```

### 2.2 データベース初期化実装
```typescript
// src/utils/database.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('pulse_timer.db');

export const initDatabase = () => {
  db.transaction(tx => {
    // timer_configs テーブル作成
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS timer_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        focus_duration INTEGER NOT NULL,
        break_duration INTEGER NOT NULL,
        long_break_duration INTEGER,
        cycles_until_long_break INTEGER DEFAULT 4,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // focus_sessions テーブル作成
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        config_id INTEGER REFERENCES timer_configs(id),
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        session_type TEXT CHECK(session_type IN ('focus', 'break', 'long_break')),
        completed BOOLEAN DEFAULT FALSE,
        interruption_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // デフォルト設定挿入
    tx.executeSql(`
      INSERT OR IGNORE INTO timer_configs (id, name, focus_duration, break_duration) 
      VALUES (1, 'ポモドーロ', 25, 5);
    `);
  });
};
```

### 2.3 Timer Store実装
```typescript
// src/stores/timerStore.

## Technical Stack
- React Native + Expo SDK 52 + TypeScript (strict mode)
- Expo Router for navigation
- Jest for unit tests
- EAS Build + EAS Submit for deployment

## Code Standards
- TypeScript strict mode, no `any`
- Minimal comments — code should be self-documenting
- Use path alias `@/` for imports from project root
- All components use functional style with proper typing
- Use StyleSheet.create for styles
- Follow React Native best practices for cross-platform compatibility

## Important Deadlines
- 2026年4月28日までにXcode 26対応が必要。ExpoがSDK対応を出し次第、eas build コマンドを再実行するだけで対応完了。期限1週間前に確認すること。
