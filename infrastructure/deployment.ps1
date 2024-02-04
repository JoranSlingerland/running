$RESOURCE_GROUP_NAME = ""
$LOCATION = ""

$APP_SERVICE_PLAN_NAME = ""
$APP_SERVICE_PLAN_SKU = "f1"

$WEB_APP_NAME = ""
$WEB_APP_RUNTIME = "NODE:18-lts"

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
    --startup-file "node standalone/server.js"