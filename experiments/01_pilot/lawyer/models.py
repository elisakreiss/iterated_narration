from dallinger.nodes import Source
import random


class CrimeReportsSource(Source):
    """A Source that reads in a random story from a file and transmits it."""

    __mapper_args__ = {
        "polymorphic_identity": "crime_reports_source"
    }

    def _contents(self):
        """Define the contents of new Infos.

        transmit() -> _what() -> create_information() -> _contents().

        stories = [
            "alexa.md",
            "bees.md",
            "flight.md",
            "pigeon.md",
            "sleep.md",
            "smuggler.md"
        ]
        """
        # # it gets to node.csv, but for some reason nowhere else...
        # self.property1 = "Please be at property1";

        stories = [
            "bees.md",
            "flight.md"
        ]
        story = random.choice(stories)
        with open("static/stimuli/{}".format(story), "r") as f:
            return f.read()