import badge
from badge.input import Buttons
from internal_os.hardware.radio import Packet
from internal_os.internalos import InternalOS

STATE_IDLE = 0
STATE_ACTIVE = 1
STATE_RESULTS = 2

internal_os = InternalOS.instance()


class App(badge.BaseApp):
    def init(self) -> None:
        self.state = STATE_IDLE
        self.id = None  # active
        self.server_id = None  # active
        self.choice_count = 2  # active, results
        self.voted = None  # active
        self.choice_totals = [0, 0]  # results
        self.should_update = True

    def on_open(self) -> None:
        self.init()

    def loop(self) -> None:
        if self.should_update:
            self.display()
            self.should_update = False
        if self.state == STATE_IDLE:
            pass
        elif self.state == STATE_ACTIVE:
            for i, btn in enumerate(
                [Buttons.SW9, Buttons.SW18, Buttons.SW10, Buttons.SW17]
            ):
                if badge.input.get_button(btn) and self.voted is None:
                    self.voted = i + 1
                    assert self.server_id and self.id is not None
                    self.send_packet(self.server_id, bytes([3, self.id, i + 1]))
                    self.should_update = True
                    break
        elif self.state == STATE_RESULTS:
            pass

    def on_packet(self, packet: Packet, in_foreground: bool) -> None:
        if not in_foreground:
            return

        if packet.data[0] == 1:
            if self.state == STATE_IDLE or self.state == STATE_RESULTS:
                self.state = STATE_ACTIVE
                self.id = packet.data[1]
                self.choice_count = packet.data[2]
                self.voted = None
                self.server_id = packet.source
                self.should_update = True
        elif packet.data[0] == 2:
            if self.state == STATE_ACTIVE:
                self.state = STATE_RESULTS
                self.choice_totals = packet.data[2:]
                self.should_update = True

    # display

    def display(self) -> None:
        badge.display.fill(1)
        if self.state == STATE_IDLE:
            badge.display.nice_text("Poll", 0, 0, 32)
            badge.display.nice_text("Waiting for\nserver...", 0, 40, 24)
        elif self.state == STATE_ACTIVE:
            badge.display.nice_text("Poll", 0, 0, 32)
            for num in range(1, self.choice_count + 1):
                badge.display.nice_text(f"Option {num}", 0, num * 24 + 16, 18)
                if self.voted == num:
                    badge.display.rect(0, num * 24 + 13, 160, 24, 0)
        elif self.state == STATE_RESULTS:
            badge.display.nice_text("Poll Results", 0, 0, 32)
            for num in range(1, self.choice_count + 1):
                badge.display.nice_text(f"Option {num}", 0, num * 24 + 16, 18)
                badge.display.nice_text(
                    str(self.choice_totals[num - 1]), 170, num * 24 + 16, 18
                )
        badge.display.show()

    def send_packet(self, dest: int, data: bytes) -> None:
        internal_os.radio._transmit_queue.append(Packet(dest, 23559, data))
