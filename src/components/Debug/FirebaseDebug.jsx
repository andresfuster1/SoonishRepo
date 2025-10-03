import { auth, db } from '../../config/firebase';

export default function FirebaseDebug() {
  const checkFirebaseConfig = () => {
    const config = {
      hasAuth: !!auth,
      hasDb: !!db,
      authApp: auth?.app?.name || 'No app',
      dbApp: db?.app?.name || 'No app',
      envVars: {
        apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: !!import.meta.env.VITE_FIREBASE_APP_ID,
      },
      actualValues: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 10) + '...',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        currentDomain: window.location.hostname,
        isDev: import.meta.env.DEV,
        isProd: import.meta.env.PROD,
      }
    };
    
    console.log('Firebase Configuration Check:', config);
    console.log('All environment variables:', import.meta.env);
    return config;
  };

  const config = checkFirebaseConfig();

  // Show if there are any configuration issues or in development
  const hasIssues = !config.hasAuth || !config.hasDb || 
                   !config.envVars.apiKey || !config.envVars.authDomain || 
                   !config.envVars.projectId;
  
  if (import.meta.env.PROD && !hasIssues) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 rounded-lg p-4 max-w-sm text-xs z-50">
      <h3 className="font-bold text-red-800 mb-2">Firebase Debug Info</h3>
      <div className="space-y-1 text-red-700">
        <div>Auth: {config.hasAuth ? '✅' : '❌'} ({config.authApp})</div>
        <div>Database: {config.hasDb ? '✅' : '❌'} ({config.dbApp})</div>
        <div>API Key: {config.envVars.apiKey ? '✅' : '❌'}</div>
        <div>Auth Domain: {config.envVars.authDomain ? '✅' : '❌'}</div>
        <div>Project ID: {config.envVars.projectId ? '✅' : '❌'}</div>
        <div>Storage Bucket: {config.envVars.storageBucket ? '✅' : '❌'}</div>
        <div>App ID: {config.envVars.appId ? '✅' : '❌'}</div>
        <div className="mt-2 pt-2 border-t border-red-200">
          <div>Domain: {config.actualValues.currentDomain}</div>
          <div>Mode: {config.actualValues.isDev ? 'Dev' : 'Prod'}</div>
          {config.actualValues.projectId && (
            <div>Project: {config.actualValues.projectId}</div>
          )}
        </div>
        <button 
          onClick={() => console.log('Full config:', config)}
          className="mt-2 px-2 py-1 bg-red-200 text-red-800 rounded text-xs hover:bg-red-300"
        >
          Log Full Config
        </button>
      </div>
    </div>
  );
}
