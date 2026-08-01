@echo off
cd /d "%~dp0"
echo [1/2] Generate katalog dari scripts\catalog-data.mjs ...
node scripts\generate-catalog.mjs
echo.
echo [2/2] Mendownload foto produk ke public\products\ ...
node scripts\fetch-product-images.mjs
echo.
pause
