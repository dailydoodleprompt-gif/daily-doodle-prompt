return (
  <div className="min-h-screen bg-background">
    <UtilityHeader onBack={onBack} />

    <main className="container max-w-2xl py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Contact Support</h1>
        <p className="text-muted-foreground mt-1">
          Need help? Submit a support request and we'll get back to you soon.
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your support request has been submitted successfully.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Support Form */}
      {/* (rest of your form stays exactly the same) */}
    </main>
  </div>
);
