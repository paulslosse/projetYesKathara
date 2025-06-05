import os
import sys
import re


def letter_to_number(letter):
    """Convert a letter to a number (A -> 1, B -> 2, etc.)."""
    return str(ord(letter.upper()) - ord("A") + 1)


def parse_lab_conf(lab_path):
    """Parse lab.conf to extract device-interface-to-network mapping."""
    connections = {}
    lab_conf = os.path.join(lab_path, "lab.conf")

    with open(lab_conf, "r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if not line or line.startswith("LAB_"):
                continue
            match = re.match(r'(\w+)\[(\d+|image)\]="?([^"]+)"?', line)
            if not match:
                continue
            device, index, network = match.groups()
            if index == "image":
                continue
            connections.setdefault(device, {})[int(index)] = network
    return connections


def parse_startup_file(startup_path):
    """Parse a .startup file and return interface configs and routes."""
    interfaces = {}
    routes = []
    with open(startup_path, "r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if "ip link set dev" in line and "address" in line:
                parts = line.split()
                iface = parts[4]
                mac = parts[-1]
                interfaces.setdefault(iface, {})["ethernet"] = mac
            elif "ip address add" in line:
                parts = line.split()
                ip, mask = parts[3].split("/")
                iface = parts[-1]
                interfaces.setdefault(iface, {})["ip"] = ip
                interfaces[iface]["mask"] = mask
            elif "ip route add" in line:
                parts = line.split()
                try:
                    dev_index = parts.index("dev")
                    iface = parts[dev_index + 1]
                except ValueError:
                    iface = None
                dest, mask = parts[3].split("/")
                gateway = parts[5] if "via" in parts else ""
                routes.append((iface, dest, mask, gateway))
    return interfaces, routes


def generate_txt_from_kathara(lab_path, output_file):
    """Generate a text file from the Kathará lab configuration."""
    connections = parse_lab_conf(lab_path)

    device_order = []
    for device in sorted(connections.keys()):
        for index, network_letter in sorted(connections[device].items()):
            device_order.append(
                (
                    (
                        int(network_letter)
                        if network_letter.isdigit()
                        else ord(network_letter)
                    ),
                    device,
                    index,
                    network_letter,
                )
            )
    device_order.sort()

    with open(output_file, "w", encoding="utf-8") as out_file:
        out_file.write("Type;Address;Mask;Gateway;Network;Ethernet\n")

        already_written = set()
        for _, device, index, network_letter in device_order:
            if (device, index) in already_written:
                continue
            already_written.add((device, index))

            startup_path = os.path.join(lab_path, f"{device}.startup")
            if not os.path.exists(startup_path):
                print(
                    f"Warning: {startup_path} does not exist. Skipping device {device}."
                )
                continue

            interfaces, routes = parse_startup_file(startup_path)

            iface = f"eth{index}"
            ip = interfaces.get(iface, {}).get("ip", "")
            mask = interfaces.get(iface, {}).get("mask", "")
            ethernet = interfaces.get(iface, {}).get("ethernet", "")
            network_number = letter_to_number(network_letter)

            if device.startswith("pc"):
                dev_type = "station"
            elif device.startswith("r"):
                dev_type = f"router {device[1:]}"
            else:
                dev_type = device

            out_file.write(f"{dev_type};{ip};{mask};;{network_number};{ethernet}\n")

            for route_iface, dest, r_mask, gateway in routes:
                if route_iface == iface:
                    out_file.write(f"routing table;{dest};{r_mask};{gateway};\n")


def main():
    """Main function to execute the script."""
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <lab_path> <output_file>")
        sys.exit(1)

    lab_dir = sys.argv[1]
    output_txt = sys.argv[2]

    if not os.path.isdir(lab_dir):
        print(f"Directory {lab_dir} does not exist.")
        sys.exit(1)

    generate_txt_from_kathara(lab_dir, output_txt)
    print(f"Network configuration written to {output_txt}")


if __name__ == "__main__":
    main()
