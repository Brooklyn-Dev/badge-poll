from typing import Self

from internal_os.hardware.radio import BadgeRadio

class InternalOS:
    radio: BadgeRadio
    @classmethod
    def instance(cls) -> Self: ...
