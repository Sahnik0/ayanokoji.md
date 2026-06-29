# Ayanokoji for Hermes installed

Enable it if you did not install with `--enable`:

```bash
hermes plugins enable ayanokoji
```

Restart Hermes or the gateway after enabling.

In shared gateways, restrict `/ayanokoji` to trusted users with Hermes slash-command access controls; runtime mode is process-local.

Commands:

- `/ayanokoji` — activate strategic execution protocol
- `/ayanokoji-review` — review current TASK.md for gaps
- `/ayanokoji-audit` — audit all four scaffold files
- `/ayanokoji-debt` — surface deferred decisions and blockers
- `/ayanokoji-gain` — strategic progress summary
- `/ayanokoji-help` — quick reference

Bundled skills are available as `ayanokoji:ayanokoji`, `ayanokoji:ayanokoji-review`, `ayanokoji:ayanokoji-audit`, `ayanokoji:ayanokoji-debt`, `ayanokoji:ayanokoji-gain`, and `ayanokoji:ayanokoji-help`.
