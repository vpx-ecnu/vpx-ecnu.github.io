from build_publication_updated import build_publication_updated


def main():
    try:
        build_publication_updated()
    except Exception as e:
        print(f"[WARN] Google Scholar publication build failed, keep existing file unchanged: {e}")


if __name__ == "__main__":
    main()
