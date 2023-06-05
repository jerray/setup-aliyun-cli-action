# Setup Aliyun CLI Action

[![GitHub Action](https://github.com/jerray/setup-aliyun-cli-action/workflows/Main/badge.svg)](https://github.com/jerray/setup-aliyun-cli-action/actions?workflow=Main)

This action installs and configures the [Aliyun command line tool](https://github.com/aliyun/aliyun-cli) for GitHub Action jobs.

## Usage

```yaml
steps:
  - uses: actions/checkout@v1
  - uses: jerray/setup-aliyun-cli-action@v1.0.0
    with:
      aliyun-cli-version: '3.0.165'
      mode: AK
      access-key-id: ${{ secrets.ALIYUN_ACCESS_KEY_ID }}
      access-key-secret: ${{ secrets.ALIYUN_ACCESS_KEY_SECRET }}
      region: ${{ secrets.ALIYUN_REGION }}
  - run: aliyun oss cp ./dir oss://backet/path -r -u
```

Use `aliyun.exe` if the job runs on Windows.

## License

MIT
