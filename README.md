# DBSCAN Visual

Интерактивная визуализация упрощённого алгоритма DBSCAN на React, TypeScript и Vite.

## Локальный запуск

Требуется установленный [Node.js](https://nodejs.org/) и npm. Команды ниже выполняются из корневой папки проекта в терминале VS Code или PowerShell.

1. Установите зависимости (команда использует зафиксированные версии из `package-lock.json`):

   ```powershell
   npm ci
   ```

2. Запустите сервер разработки, доступный по адресу localhost:

   ```powershell
   npm run dev -- --host localhost
   ```

3. Откройте адрес, показанный в терминале. Обычно это [http://localhost:5173](http://localhost:5173). Если порт занят, Vite выберет следующий свободный порт и выведет новый адрес.

Чтобы остановить сервер, нажмите `Ctrl+C` в терминале.

## Проверка production-сборки

```powershell
npm run build
```
