
# maisandbox 2

## maisandboxとは

wandbox,ideoneのような即席のコーディング環境をローカルに構築します．

## development environment

- windows 10
- nodejs

`src/back/task` の中身をすべて書き換えれば `ubuntu` でも動くかもしれません．

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

## systemd 

- `npm run build`
- `sudo sh ./install.sh`

## 開発ツールのインストール

```
npm i -g babelify browserify
```

## winserすごいよね

- https://qiita.com/Kazunori-Kimura/items/c40ce82e7c044869fd27

## トラブルシューティング

### WSL(bash on ubuntu on windows)系のコマンドが正しく動かない

- 「コンピュータの管理」から「サービス」を開きます．
- 「maisandbox2」のプロパティを開きます．
- 「ログオン」「アカウント」を選んで，maisandbox2を管理しているユーザ名とパスワードを入力．
- 「maisandbox2」サービスを再起動する．

## cLayが動かない

- gitignoreしています
- `tool/clay.exe` にコンパイルしたものを置いてください
