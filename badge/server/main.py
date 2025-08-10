from badge import BaseApp


class App(BaseApp):
    def on_open(self) -> None:
        print("opened badge server")

    def loop(self) -> None:
        pass
