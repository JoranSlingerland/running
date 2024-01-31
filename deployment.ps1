$RESOURCE_GROUP_NAME = "Dev"
$LOCATION = "westeurope"

$APP_SERVICE_PLAN_NAME = "test-app-service-plan"
$APP_SERVICE_PLAN_SKU = "f1"

$WEB_APP_NAME = "test-web-app-43fsd32"
$WEB_APP_RUNTIME = "NODE:18-lts" # This is not the latest version of Node, but it is the version supported by Azure App Service at the time of writing this article.

az group create `
    --name $RESOURCE_GROUP_NAME `
    --location $LOCATION

az appservice plan create `
    --resource-group $RESOURCE_GROUP_NAME `
    --location $LOCATION `
    --is-linux `
    --name $APP_SERVICE_PLAN_NAME `
    --sku $APP_SERVICE_PLAN_SKU

az webapp create `
    --resource-group $RESOURCE_GROUP_NAME `
    --plan $APP_SERVICE_PLAN_NAME `
    --name $WEB_APP_NAME `
    --https-only $true `
    --runtime $WEB_APP_RUNTIME `
    --assign-identity [system]

az webapp config set `
    --resource-group $RESOURCE_GROUP_NAME `
    --name $WEB_APP_NAME `
    --startup-file "node .next/standalone/server.js"