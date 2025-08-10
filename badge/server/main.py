import random
import badge
from badge.input import Buttons
from internal_os.hardware.radio import Packet
from internal_os.internalos import InternalOS
from .uQR import QRCode

CHOICE_IMAGES = [
    badge.display.import_pbm(f'/apps/PollServer/{image}.pbm')
    for image in ['circle', 'circle', 'circle', 'circle']
]

STATE_IDLE = 0
STATE_ACTIVE = 1
STATE_RESULTS = 2

internal_os = InternalOS.instance()


class App(badge.BaseApp):
    def init(self) -> None:
        self.state = STATE_IDLE
        self.id = None  # active
        self.choice_count = 2  # idle, active, results
        self.choice_totals = [0, 0]  # active, results
        self.qr: list[list[bool]] | None = None  # results
        self.should_update = True
        random.seed()

    def on_open(self) -> None:
        self.init()

    def loop(self) -> None:
        if self.should_update:
            self.display()
            self.should_update = False

        if self.state == STATE_IDLE:
            # choice count buttons
            if badge.input.get_button(Buttons.SW15):
                self.choice_count = 2
                self.should_update = True
            elif badge.input.get_button(Buttons.SW8):
                self.choice_count = 3
                self.should_update = True
            elif badge.input.get_button(Buttons.SW16):
                self.choice_count = 4
                self.should_update = True
            # start button
            elif badge.input.get_button(Buttons.SW5):
                self.state = STATE_ACTIVE
                self.id = random.getrandbits(8)
                self.choice_totals = [0] * self.choice_count
                self.should_update = True
                self.send_packet(0xFFFF, bytes([1, self.id, self.choice_count]))
        elif self.state == STATE_ACTIVE:
            # stop button
            if badge.input.get_button(Buttons.SW4):
                self.state = STATE_RESULTS
                self.qr = None
                self.should_update = True
                self.send_packet(
                    0xFFFF, bytes([2, self.choice_count] + self.choice_totals)
                )
        elif self.state == STATE_RESULTS:
            # reset button
            if badge.input.get_button(Buttons.SW12):
                self.state = STATE_IDLE
                self.should_update = True
            # qr button
            elif badge.input.get_button(Buttons.SW7):
                qr = QRCode()
                string = ','.join(map(str, self.choice_totals))
                qr.add_data(string, 0)
                self.qr = qr.get_matrix()  # type: ignore
                self.should_update = True

    def on_packet(self, packet: badge.radio.Packet, in_foreground: bool) -> None:
        if not in_foreground:
            return
        data = packet.data
        if data[0] == 3:  # poll answer
            self.logger.info('****************** Received poll answer:', data[0], data[1], data[2], self.id, self.state)
            if (
                packet.dest != 0xFFFF
                and self.state == STATE_ACTIVE
                and data[1] == self.id
            ):
                choice = data[2]
                if 1 <= choice <= self.choice_count:
                    self.choice_totals[choice - 1] += 1
                    self.should_update = True

    # display

    def display(self) -> None:
        badge.display.fill(1)
        if self.state == STATE_IDLE:
            badge.display.nice_text("Poll Server", 0, 0, 32)
            badge.display.nice_text("Choose option count", 0, 40, 18)
            for num in range(2, 5):
                font_size = 24 if num == self.choice_count else 18
                badge.display.nice_text(str(num), num * 40 - 40, 72, font_size)
        elif self.state == STATE_ACTIVE:
            badge.display.nice_text("Ongoing Poll", 0, 0, 32)
            for num in range(1, self.choice_count + 1):
                badge.display.blit(CHOICE_IMAGES[num - 1], 0, num * 36 + 16)
                badge.display.nice_text(f"Option {num}", 36, num * 36 + 23, 18)
                badge.display.nice_text(
                    str(self.choice_totals[num - 1]), 170, num * 36 + 16, 32
                )
        elif self.state == STATE_RESULTS:
            if self.qr:
                scale = min(
                    badge.display.width // len(self.qr[0]),
                    badge.display.height // len(self.qr),
                )
                for r in range(len(self.qr)):
                    for c in range(len(self.qr[r])):
                        # badge.display.pixel(c, r, 0 if self.qr[r][c] else 1)
                        badge.display.fill_rect(
                            c * scale,
                            r * scale,
                            scale,
                            scale,
                            0 if self.qr[r][c] else 1,
                        )
            else:
                badge.display.nice_text("Poll Results", 0, 0, 32)
                for num in range(1, self.choice_count + 1):
                    badge.display.blit(CHOICE_IMAGES[num - 1], 0, num * 36 + 16)
                    badge.display.nice_text(
                        str(self.choice_totals[num - 1]), 170, num * 36 + 23, 18
                    )
                badge.display.nice_text("SW12 = reset", 0, 180, 18)
        badge.display.show()

    def send_packet(self, dest: int, data: bytes) -> None:
        internal_os.radio._transmit_queue.append(Packet(dest, 23560, data))
