
# maisandbox 2

## maisandboxとは

wandbox,ideoneのような即席のコーディング環境をローカルに構築します．

## development environment

- windows 10 / Ubuntu 18.04
- nodejs

Windows 10 の場合、WSLとcygwinがあると嬉しい  
これ以外の環境でも動くかもしれません．

## usage

- `npm run build`
- `npm run start`
- access `localhost:11450/`

## windows サービスとして install

- launch cmd (administrator)
- `npm run install-service`

## windows サービスとして uninstall

- launch cmd (administrator)
- `npm run uninstall-service`

## systemd として install

- `npm run build`
- `sudo sh ./install.sh`

## systemd として uninstall

- TODO:

## 開発ツールのインストール

```
npm i -g babelify browserify
```

## トラブルシューティング

### WSL(bash on ubuntu on windows)系のコマンドが正しく動かない

- 「コンピュータの管理」から「サービス」を開きます．
- 「maisandbox2」のプロパティを開きます．
- 「ログオン」「アカウント」を選んで，maisandbox2を管理しているユーザ名とパスワードを入力．
- 「maisandbox2」サービスを再起動する．

## cLayが動かない

- gitignoreしています
- `tool/clay.exe` にコンパイルしたものを置いてください
